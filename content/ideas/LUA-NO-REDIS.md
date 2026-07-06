Me fala mais sobre isso:Atomicidade e transações: como é single-threaded, comandos individuais já são atômicos. Pra agrupar vários, tem MULTI/EXEC (transação) e, mais poderoso, scripts Lua (EVAL) — um script Lua roda atomicamente no servidor, ideal pra lógica "leia-e-decida" que não pode ter race (rate limiting sofisticado, lock check-and-set). Saber que Lua roda atômico é um plus.Boa escolha de tópico, esse é dos que mais separam quem "usa Redis pra cachear" de quem entende Redis de verdade. Vou destrinchar devagar porque tem uma sutileza importante no meio (o MULTI/EXEC não é o que parece).
Ponto de partida: por que single-thread dá atomicidade de graça.
O Redis executa um comando por vez, do começo ao fim, sem intercalar com outro. Então quando você faz INCR contador, é impossível dois clientes incrementarem "ao mesmo tempo" e um sobrescrever o outro — eles são serializados pelo próprio Redis, um roda inteiro, depois o outro. Compara com o problema clássico de x = x + 1 em código concorrente, onde dois threads leem 5, ambos escrevem 6, e você perdeu um incremento (lost update). No Redis isso não acontece para um comando individual, porque não existe "ao mesmo tempo" — a fila de comandos é serial. Esse é o presente que o single-thread te dá: cada comando é um ponto atômico.
O problema aparece quando você precisa de mais de um comando pra fazer uma operação lógica, e não pode deixar outro cliente se meter no meio. Aí você tem duas ferramentas, e elas são bem diferentes apesar de as duas serem vendidas como "atômicas".
Ferramenta 1: MULTI/EXEC — e aqui está a sutileza que engana muita gente.
MULTI/EXEC é chamado de "transação", mas não é transação no sentido que você conhece do SQL. Isso é o que pega gente em entrevista. Como funciona: você manda MULTI, depois vai mandando comandos (que o Redis não executa, só enfileira), e quando manda EXEC, ele roda todos os comandos enfileirados em sequência, sem intercalar nenhum outro comando de outro cliente no meio. Então o bloco inteiro roda atomicamente no sentido de "isolamento" — ninguém vê um estado parcial, nada se intromete entre teus comandos.
Mas — e é um mas grande — não tem rollback. Se o terceiro comando de cinco falhar (digamos, você fez INCR numa chave que contém texto, não número), os outros quatro já rodaram e não são desfeitos. No SQL, erro no meio da transação faz rollback de tudo. No Redis, MULTI/EXEC não tem esse conceito — ele garante que o bloco roda junto e isolado, mas não garante "tudo ou nada" diante de erro. Isso quebra a intuição de quem vem de banco relacional. A palavra "transação" na doc do Redis significa "bloco isolado", não "unidade atômica com rollback". Se te perguntarem isso e você souber a diferença, você se destaca na hora.
A segunda limitação do MULTI/EXEC, e a mais séria na prática: você não pode usar o resultado de um comando pra decidir o próximo. Como os comandos são enfileirados e só executam no EXEC, você não vê o retorno de nenhum até o fim. Então o padrão "leia o saldo, se for maior que X, debite" não dá com MULTI/EXEC puro — você não tem o valor lido na hora de decidir. Isso é exatamente a lógica "leia-e-decida" que eu citei, e é onde o MULTI/EXEC te deixa na mão.
Existe um remendo pra isso no MULTI/EXEC: o comando WATCH. Você "vigia" uma chave antes do MULTI; se ela mudar entre o WATCH e o EXEC, o EXEC falha (retorna nulo) e você tenta de novo. É optimistic locking — assume que ninguém vai mexer, e se alguém mexeu, aborta e recomeça. Funciona, mas é chato: você tem que escrever o loop de retry, e sob contenção alta (muita gente mexendo na mesma chave) fica reprocessando muito. É o mesmo modelo mental do optimistic concurrency com version column no SQL, se você já viu isso.
Ferramenta 2: script Lua (EVAL) — a solução de verdade pra "leia-e-decida".
Aqui está a ferramenta poderosa. Você escreve um pequeno script em Lua, manda pro Redis com EVAL, e o Redis executa o script inteiro atomicamente — do primeiro ao último comando do script, nada de outro cliente roda no meio, como qualquer comando individual. A diferença mágica pro MULTI/EXEC: dentro do script você tem lógica de verdade — você lê um valor, guarda numa variável, faz um if, e decide o que fazer, tudo no servidor, tudo atômico.
O exemplo canônico é o "leia-e-decida" que o MULTI/EXEC não resolve. Lock check-and-set, ou débito condicional:
lua-- pega o saldo atual
local saldo = tonumber(redis.call('GET', KEYS[1]))
-- decide baseado no que leu
if saldo >= tonumber(ARGV[1]) then
  redis.call('DECRBY', KEYS[1], ARGV[1])
  return 1   -- debitou
else
  return 0   -- saldo insuficiente
end
Isso roda atomicamente. Entre o GET do saldo e o DECRBY, é impossível outro cliente se meter e mudar o saldo, porque o script inteiro é um bloco serial no single-thread do Redis. O lost update (dois clientes debitando o mesmo saldo e furando o limite) fica impossível por construção — sem WATCH, sem retry loop, sem race. A lógica condicional que precisava do valor lido roda no servidor, onde ela tem acesso atômico ao valor.
Por que isso importa e onde aparece na vida real:
Rate limiting sofisticado: "quantas requisições esse usuário fez na última janela? se passou do limite, rejeita; senão, incrementa e permite." É leia-conte-decida-incrementa, tudo tendo que ser atômico senão dois requests concorrentes furam o limite. Lua resolve num script. Aliás, a biblioteca de rate limiting que você provavelmente usaria por baixo dos panos faz exatamente isso.
Lock distribuído com liberação segura: pra soltar um lock com segurança, você precisa checar "esse lock ainda é meu?" antes de deletar (senão você deleta o lock que já foi reatribuído a outro processo depois do teu expirar). Isso é leia-o-dono-compare-com-o-meu-id-e-só-então-delete. Tem que ser atômico, senão tem race entre o check e o delete. Script Lua é a forma canônica de fazer unlock seguro.
Qualquer "check-and-set" complexo onde a decisão depende do estado atual e não pode haver janela entre ler e agir.
O trade-off do Lua, pra você não sair achando que é sempre a resposta:
Como o script roda atomicamente e o Redis é single-thread, um script lento bloqueia o servidor inteiro — nenhum outro comando de ninguém roda enquanto teu script executa. Então script Lua tem que ser curto e rápido. Nada de loop pesado, nada de processar mil chaves num script. A regra é: lógica de decisão pequena e localizada, não computação. Se você abusar, transforma a maior força do Redis (single-thread previsível) na maior fraqueza (um script travando tudo). Esse é o "mas" que mostra que você entende o custo, e é bom mencionar na entrevista pra não parecer que você acha Lua uma bala de prata.
Resumindo o mapa de decisão, que é como vale guardar na cabeça:
Comando único (INCR, SET NX) → já é atômico, não precisa de nada.
Vários comandos que só precisam rodar juntos e isolados, sem depender do resultado um do outro → MULTI/EXEC (lembrando: isolamento sim, rollback não).
Vários comandos onde você precisa ler e decidir com base no valor, atomicamente → script Lua. É a única que te dá lógica condicional atômica de verdade.
Optimistic locking com retry, se você quer evitar Lua por algum motivo → WATCH/MULTI/EXEC, aceitando o loop de retry.
A frase que fecha isso numa entrevista: "o single-thread do Redis dá atomicidade por comando de graça; quando preciso de leia-e-decida atômico eu vou de script Lua, porque MULTI/EXEC isola mas não deixa eu usar o valor lido pra decidir — e mantenho o script curto porque ele bloqueia o servidor inteiro." Isso mostra que você entende os três níveis e o custo de cada um, que é bem além do que a maioria sabe.
Pode voltar pra leitura. Próxima dúvida quando bater.Ué, mas se o negócio só vai executar quando eu mando um "EXEC", se der exception no meio eu não vou dar exec, é como se tivesse feito um rollback, não?Ah, boa — mas aqui tem uma confusão de quando as coisas acontecem, e desfazer ela é justamente o pulo do gato. A resposta é não, e o motivo é que existem dois momentos distintos onde algo pode dar errado, e o EXEC só te protege de um deles.
A questão é: exception onde? Tem duas fases.
Fase 1 — enfileiramento (entre o MULTI e o EXEC). Aqui você está mandando os comandos e o Redis só está guardando eles numa fila, sem executar. Se der erro nessa fase — por exemplo, você mandou um comando que não existe, ou com número errado de argumentos (um erro de sintaxe) — aí sim, o Redis marca a transação como suja e, quando você mandar EXEC, ele recusa e não roda nada. Nesse caso específico, é como você imaginou: deu ruim antes, não executa, "rollback" de graça. Aqui você tem razão.
Fase 2 — execução (depois que você mandou o EXEC). E é aqui que tua intuição quebra. Os comandos ficaram enfileirados válidos (sintaticamente ok), você mandou EXEC, e o Redis começa a rodar a fila. O EXEC é um único disparo que executa todos de uma vez — você não roda um, olha o resultado, e decide rodar o próximo. Você já se comprometeu com o bloco inteiro no momento em que mandou EXEC. E aí um comando pode falhar em runtime, não por sintaxe, mas por semântica: o comando é válido, mas errado pro dado.
O exemplo clássico: você tem uma chave que guarda o texto "abacaxi", e no meio da transação você manda INCR nela. Sintaticamente INCR chave é perfeito — o Redis aceita e enfileira sem reclamar, porque ele não sabe (nem checa) o conteúdo da chave na hora de enfileirar. Só quando o EXEC roda e chega nesse INCR é que o Redis descobre "opa, isso não é número, não dá pra incrementar" e esse comando falha. Mas os comandos que vieram antes dele na fila já rodaram, e os que vêm depois continuam rodando. O Redis não para, não desfaz nada. Ele executa o bloco inteiro, um comando com erro no meio vira só um erro no meio dos resultados, e o resto acontece normalmente.
Repara na diferença crucial: o teu "se der exception eu não mando EXEC" pressupõe que você vê o erro antes de decidir mandar o EXEC. Mas na fase 2, o erro só acontece depois do EXEC, quando já não há mais decisão a tomar — você já disparou. Não existe um ponto onde você olha "deu erro no comando 3, vou abortar" — o EXEC é atômico no sentido de "roda tudo junto sem intercalar", e quando ele te devolve a resposta, tudo já aconteceu. O erro do comando 3 chega pra você como parte do array de resultados, junto com os sucessos dos comandos 1, 2, 4 e 5 que já foram aplicados.
É por isso que a doc do Redis é cuidadosa em dizer que isso não é rollback. Num banco SQL, o INCR num texto dispararia o rollback de tudo que veio antes na transação. No Redis, os anteriores ficam, o problemático falha isoladamente, e a vida segue. A transação garantiu isolamento (nenhum outro cliente rodou comando no meio do teu bloco) e enfileiramento atômico (ou roda o bloco todo ou, se houve erro de sintaxe no enfileiramento, nenhum), mas não garante "tudo-ou-nada diante de erro de execução".
Então costurando com tua pergunta: você está certo pro erro de enfileiramento (fase 1, antes do EXEC — aí realmente não executa). Você está errado pro erro de execução (fase 2, durante o EXEC — aí já executou parcialmente e não desfaz). E o segundo caso é o perigoso, porque é o erro semântico (dado do tipo errado, operação inválida pro conteúdo) que só se revela rodando, e que num banco relacional você confiaria que o rollback ia limpar. No Redis não limpa.
E isso reforça por que o script Lua é superior pra lógica séria: no Lua, como você tem controle de fluxo de verdade, você lê e checa antes de agir, então você nunca chega a executar o comando ruim — você preveniu o erro em vez de torcer pra um rollback que não existe. O MULTI/EXEC te obriga a enfileirar às cegas e descobrir o problema tarde demais; o Lua te deixa olhar antes de pular.
Fez sentido a distinção das duas fases? É exatamente essa separação — erro antes do EXEC vs erro durante o EXEC — que o teu raciocínio tinha colapsado numa coisa só.ah entendi, mas aí é só fazer checkagem de inputs, isso provavelmente vai ser notado na fase de desenvolvimentoÉ, na maioria dos casos você tem razão, e vale reconhecer isso em vez de inflar o problema. O erro de tipo (INCR num texto) é quase sempre bug de programação, não condição de runtime legítima — se você está incrementando uma chave, ela deveria conter número, e se contém texto é porque alguém errou em algum lugar. Esse tipo você pega no desenvolvimento, com teste, com TypeScript tipando o que vai pra cada chave. Concordo. Na prática, MULTI/EXEC "estourando parcialmente" por erro de tipo é raro num código bem escrito, e você não vai passar as noites acordado com isso.
Mas deixa eu marcar onde o "é só checar input" não cobre, porque é aí que a distinção deixa de ser acadêmica — e não é no erro de tipo, é em outro lugar.
O verdadeiro problema do MULTI/EXEC nunca foi "erro no meio derruba a atomicidade". Isso é edge case. O problema de verdade, o que faz você escolher Lua em produção, é o que eu falei antes: você não pode usar o valor lido pra decidir. E isso não é questão de validar input — é uma limitação estrutural que nenhuma checagem resolve.
Repara na diferença entre os dois problemas:
O erro de tipo é sobre dado malformado, e você previne validando na entrada. Resolvido no dev, como você disse.
O "leia-e-decida" é sobre lógica que depende do estado atual do Redis no instante da execução, e isso você não tem como validar antes, porque o valor pode mudar entre o momento em que você leria e o momento em que você agiria. Exemplo concreto: "debite 100 do saldo se o saldo for >= 100". Você não pode checar isso no input, porque o saldo não está no input — está no Redis, e está mudando. Se você faz GET saldo (vê 100), decide debitar, e manda um MULTI/EXEC com o DECRBY, outro cliente pode ter debitado no meio e agora o saldo é 50 — teu débito fura pra saldo negativo. Validação de input não te salva porque o problema não é o input estar errado, é o estado ter mudado embaixo de você. É race condition, não dado malformado.
Então a régua fica assim, e é o que vale levar pra entrevista:
Se tua operação é "faça esses N comandos juntos e isolados", e os comandos não dependem de ler-e-decidir → MULTI/EXEC serve, e o risco de erro parcial você elimina com código correto e validação, exatamente como você falou. Você está certo aqui.
Se tua operação é "leia o estado atual, e baseado nele decida o que fazer", atomicamente → MULTI/EXEC não serve, e não é questão de checar melhor os inputs, é que a ferramenta estruturalmente não te deixa condicionar a ação ao valor lido. Aí é Lua (ou WATCH com retry). Isso não some com desenvolvimento cuidadoso, é limitação de design.
Ou seja, teu contra-argumento derruba corretamente a preocupação com erro parcial (que era o assunto da tua pergunta anterior e é mesmo secundário), mas não toca a razão principal de o Lua existir, que é o leia-e-decida. Foi bom você empurrar nisso, porque agora fica limpo: a fraqueza do MULTI/EXEC que importa não é "pode falhar no meio" (isso você previne), é "não pode decidir com base no que leu" (isso você não previne, tem que trocar de ferramenta).
E olha como isso reconecta com uma coisa que você já domina: é o mesmo motivo pelo qual, nos smart contracts, você faz o check e o effect na mesma transação atômica em vez de ler o estado numa call e agir em outra. A janela entre ler e agir é onde mora o bug de concorrência, on-chain e off-chain. Você já tem esse instinto calibrado do mundo de contratos — o require(saldo >= valor) seguido do débito, tudo atômico na mesma tx. Lua no Redis é a mesma ideia: fechar a janela entre ler e decidir. Só mudou o cenário.
Pode voltar pra leitura, tá indo bem essas interrupções.tô sentindo as coisas um pouco abstratas de mais, me mostre um exemplo de multi/exec escrito de 2 formas diferentes: uma no node em typescript adicionando vários comandos e outra no node em typescript, mas usando essa parada que vc falou do Lua.Boa, vamos aterrissar num exemplo concreto. Vou usar um caso onde os dois modos existem: débito de saldo com verificação ("só debita se tiver saldo suficiente"). É o caso perfeito porque mostra exatamente onde o MULTI/EXEC tropeça e o Lua resolve.
Vou usar a lib ioredis, que é a mais comum em Node/TS pra isso.
Versão 1: MULTI/EXEC (e por que ela é problemática aqui)
Pra fazer "leia-e-decida" com MULTI/EXEC, você é obrigado a ler fora da transação, decidir no teu código, e usar WATCH pra detectar se alguém mexeu no meio. Fica assim:
typescriptimport Redis from 'ioredis'
const redis = new Redis()

async function debitar(chave: string, valor: number): Promise<boolean> {
  // 1. VIGIA a chave: se ela mudar antes do EXEC, a transação aborta
  await redis.watch(chave)

  // 2. LÊ o saldo (fora da transação, no teu código)
  const saldoStr = await redis.get(chave)
  const saldo = Number(saldoStr ?? 0)

  // 3. DECIDE no teu código, não no Redis
  if (saldo < valor) {
    await redis.unwatch()       // desiste, libera o watch
    return false                // saldo insuficiente
  }

  // 4. Só agora enfileira o comando e tenta executar
  const resultado = await redis
    .multi()
    .decrby(chave, valor)
    .exec()

  // 5. Se resultado === null, alguém mexeu na chave entre o WATCH e o EXEC:
  //    a transação foi abortada. Você teria que TENTAR DE NOVO.
  if (resultado === null) {
    return debitar(chave, valor)   // retry (cuidado: pode recursar muito sob contenção)
  }

  return true
}
Repara na dor:
O watch + get + decisão no código + multi/exec + checar se abortou + retry é um bocado de cerimônia pra uma operação conceitualmente simples. E o if (saldo < valor) roda no teu processo Node, com um valor que você leu num instante e que pode estar velho quando o exec roda. O WATCH existe só pra te avisar "ei, mudou, seu valor tá velho, aborta". Aí você recomeça. Sob contenção alta (muita gente debitando a mesma chave), você fica reprocessando esse loop várias vezes — cada retry é mais uma ida e volta na rede. É optimistic locking: funciona, mas é verboso e degrada sob concorrência.
E se você esquecer o WATCH? Aí tem o bug de corrida: dois debitar concorrentes leem saldo 100, ambos decidem que dá pra debitar 100, ambos mandam o decrby, e o saldo vai pra -100. O WATCH é o que te protege disso, mas é você que tem que lembrar de pôr.
Versão 2: Lua (EVAL)
Agora o mesmo débito, com a lógica de decisão dentro do Redis:
typescriptimport Redis from 'ioredis'
const redis = new Redis()

// O script Lua: lê, decide e age — tudo atômico, tudo no servidor
const scriptDebito = `
  local saldo = tonumber(redis.call('GET', KEYS[1]) or '0')
  if saldo >= tonumber(ARGV[1]) then
    redis.call('DECRBY', KEYS[1], ARGV[1])
    return 1
  else
    return 0
  end
`

async function debitar(chave: string, valor: number): Promise<boolean> {
  const resultado = await redis.eval(
    scriptDebito,
    1,          // quantas KEYS estou passando
    chave,      // KEYS[1]
    valor       // ARGV[1]
  )
  return resultado === 1
}
É isso. Sem watch, sem ler fora e decidir dentro, sem loop de retry, sem risco de esquecer proteção. Você manda o script, o Redis executa GET → if → DECRBY como um bloco atômico indivisível, e te devolve 1 (debitou) ou 0 (saldo insuficiente). Entre o GET e o DECRBY nenhum outro cliente roda, porque o script inteiro é serial no single-thread do Redis. O race condition que o WATCH combatia com retry aqui simplesmente não pode existir.
Compara o que roda onde:
No MULTI/EXEC, a decisão (if saldo < valor) roda no teu Node, com dado que viajou pela rede e pode estar velho, e você precisa do WATCH+retry pra compensar.
No Lua, a decisão (if saldo >= ...) roda dentro do Redis, com o dado no lugar onde ele vive, no exato instante da ação, sem janela pra ninguém se meter.
Detalhe de produção (pra você não sair achando que manda o script cru toda vez)
Na prática você não manda o texto do script em toda chamada — isso desperdiça banda. O ioredis deixa você "registrar" o script como um comando, e ele usa EVALSHA por baixo (manda só um hash do script, não o texto):
typescriptredis.defineCommand('debitar', {
  numberOfKeys: 1,
  lua: scriptDebito,
})

// agora vira um "comando" do redis, tipado e limpo:
async function debitar(chave: string, valor: number): Promise<boolean> {
  const resultado = await (redis as any).debitar(chave, valor)
  return resultado === 1
}
Mesma atomicidade, sem reenviar o texto do script toda vez. É assim que se usa Lua de verdade em produção.
O resumo que fecha
A versão MULTI/EXEC te obriga a: ler fora → decidir no código → vigiar com WATCH → executar → detectar aborto → repetir. Seis passos, com race se você esquecer o WATCH e retry-storm sob contenção.
A versão Lua: um passo, atômico por construção, race impossível.
É por isso que, pra qualquer coisa que seja "leia-e-decida", a resposta em produção é Lua, e o MULTI/EXEC fica pros casos onde você só quer disparar vários comandos juntos sem precisar do valor de um pra decidir o outro (tipo "incrementa esse contador E adiciona nesse set E seta essa expiração", tudo cego, sem if no meio).
Ficou concreto agora? Se quiser, mostro o caso "cego" onde o MULTI/EXEC é a escolha certa (sem if, só vários comandos juntos), pra você ver o contraste de quando cada um brilha.Bacana, e isso é comum de se ver? Ou só pra casos avançados?Boa pergunta pra calibrar o quão "isso vale meu tempo" antes de amanhã. A resposta honesta, separando as duas ferramentas:
MULTI/EXEC: comum de ver, mas menos do que já foi. Você encontra em código que existe, em tutoriais, e todo mundo que estuda Redis esbarra nele. Mas na prática moderna ele é meio que espremido por dois lados: pra operação simples, comando único já resolve atômico; pra leia-e-decida, Lua é melhor. Então sobra pro MULTI/EXEC aquele meio-termo "vários comandos cegos juntos" que é um caso real mas não tão frequente. Você precisa conhecer pra entrevista (cai como pergunta conceitual, principalmente a pegadinha do "não tem rollback"), mas não é algo que você escreve toda semana.
Lua: menos comum de você escrever, mais comum de você usar sem saber. E essa é a distinção que importa. Escrever script Lua na mão é, sim, território mais avançado — o dev backend médio pode passar anos sem escrever um. Mas Lua está rodando embaixo de ferramentas que você usa direto:
O BullMQ que mencionei (filas em Node) é cheio de scripts Lua por dentro — mover job de uma fila pra outra, marcar como completo, tudo atômico via Lua, porque essas operações são leia-e-decida clássicas. Bibliotecas de rate limiting quase sempre usam Lua por baixo (a operação "conta e decide se passou do limite" é o exemplo canônico). Bibliotecas de lock distribuído usam Lua pro unlock seguro. Então o Lua está no teu stack mesmo quando você não escreve nenhum — os autores das libs escreveram por você.
Onde isso te posiciona pra amanhã, sendo prático:
O que é esperado de um backend sênior: entender os conceitos — single-thread dá atomicidade por comando, MULTI/EXEC isola mas não faz rollback e não deixa usar o valor lido, Lua roda atômico e resolve leia-e-decida mas bloqueia o servidor se for lento. Isso é conhecimento conceitual que diferencia e é justo esperar. Saber que existe e quando cada um serve.
O que não é esperado, e você não precisa decorar: a sintaxe exata do Lua, a assinatura do eval, os detalhes do EVALSHA. Ninguém vai te pedir pra escrever um script Lua correto de cabeça numa entrevista de backend Node (a menos que a vaga seja muito específica de Redis/infra). Se pedirem, é aceitável dizer "eu sei que o script lê e decide atomicamente, a sintaxe eu consulto na hora" — o que importa é você saber que é a ferramenta certa pro problema e por quê.
Então minha recomendação de esforço: domine o conceito, não decore a sintaxe. A frase de entrevista que te posiciona bem sem precisar cravar código é algo como "pra operação atômica que depende de ler e decidir, eu uso script Lua, que roda atômico no servidor — na prática frequentemente vem embrulhado numa lib como BullMQ ou um rate limiter, que usam Lua por baixo". Isso mostra que você entende a mecânica e sabe onde ela aparece na vida real, sem bancar o especialista em Lua que você não precisa ser.
E honestamente: pra uma entrevista de backend Node.js genérica, Redis provavelmente vai cair na camada "como você cachearia isso", "como faria rate limiting", "como processaria job assíncrono" — e aí a resposta é cache-aside com TTL, rate limit com contador, BullMQ pra jobs. A camada MULTI/Lua é aprofundamento que pode vir se o entrevistador puxar, e aí você ter o conceito na ponta da língua é o que separa "sei usar Redis" de "entendo Redis". Bom saber, provavelmente não central.
Quer voltar pra leitura de onde parou (acho que você tinha pausado antes dos data types e dos casos de uso), ou já sente que pegou o suficiente de Redis e quer usar o tempo restante em outro tópico mais provável de cair?