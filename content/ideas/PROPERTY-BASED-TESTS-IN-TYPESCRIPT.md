Quero me aprofundar em mais algumas coisas q vc mencionou, mas antes que eu me esqueça, quero perguntar sobre uma coisa que fiquei refletindo outro dia. No desenvolvimento de smart contracts eu usei muito invariant tests com fuzzing. E fiquei imaginando que isso também seria possível em backend offchain, mas nunca vi ngm falando. Como é isso? Tem gente fazendo isso? Vale a pena? É novo, por isso não ouvi ngm falar? É muito custoso, trabalhoso ou overkill?Boa reflexão, e a resposta curta é: não é novo, sim tem gente fazendo, e a razão de você não ver ninguém falando no mundo backend é mais cultural/histórica do que técnica. Deixa eu destrinchar porque tem várias camadas aqui.
Property-based testing é bem mais antigo que os invariant tests de smart contract. O que você fez com fuzzing no Foundry é, conceitualmente, property-based testing — e ele nasceu em 1999 com o QuickCheck, em Haskell. Foundry/Echidna trouxeram isso pro mundo Solidity e deram o nome "invariant testing", mas a ideia (gerar entradas aleatórias e checar que uma propriedade/invariante se mantém, em vez de asserir saídas específicas de entradas fixas) é a mesma coisa que a comunidade de linguagens funcionais faz há 25 anos. Então não é que o backend não tem — é que o mundo Solidity redescobriu e rebatizou uma técnica que já existia, e o marketing do Foundry a tornou muito mais visível no seu círculo do que ela jamais foi no círculo backend mainstream.
Existe ferramenta madura pra isso em quase toda linguagem. Em JS/TS o equivalente direto é o fast-check. Python tem Hypothesis (excelente, muito usado). Java tem jqwik. Scala tem ScalaCheck. Todos fazem o mesmo: você declara uma propriedade, a lib gera centenas de entradas aleatórias, e quando acha um contra-exemplo faz shrinking — reduz o caso que falhou pro menor exemplo que ainda quebra, igualzinho ao que o Foundry faz quando te entrega o input mínimo que viola a invariante. Então a maquinaria que você já conhece existe pronta pro backend.
Por que você não ouve ninguém falando, então? Algumas razões que se somam:
A cultura de teste backend mainstream é dominada por example-based (arrange-act-assert com casos fixos) e por mocking. Property-based exige uma mudança de mentalidade — pensar em invariantes em vez de exemplos — que a maioria dos devs backend nunca foi treinada a fazer. No mundo smart contract você foi meio que forçado a isso porque o custo de um bug é dinheiro perdido irreversível, então a comunidade investiu pesado na técnica. No backend, "é só corrigir e fazer deploy de novo" reduziu a pressão evolutiva pra adotar algo mais rigoroso.
Onde é mais difícil no backend do que em smart contract: estado e efeitos colaterais. Um smart contract é relativamente autocontido e determinístico — você tem o estado on-chain e funções puras-ish operando sobre ele, o que é o cenário ideal pra invariant testing. Backend típico é cheio de I/O: banco, rede, filas, relógio, serviços externos. Fuzzear uma função pura é trivial; fuzzear um fluxo que toca o Postgres e chama o Stripe é bem mais trabalhoso, porque você precisa controlar ou modelar todo esse mundo externo pra que o teste seja determinístico e a invariante seja checável. Isso é parte grande de por que a técnica não pegou tão naturalmente no backend: o alvo é mais bagunçado.
Onde vale muito a pena no backend (e tem gente fazendo):
Lógica pura de negócio é o alvo perfeito, e é onde property-based brilha independente de ser on ou off-chain. Cálculo financeiro (juros, impostos, rateio, arredondamento), conversão de moeda, parsing/serialização (a propriedade clássica: parse(serialize(x)) === x, o round-trip), qualquer transformação de dados, máquinas de estado (transições válidas nunca levam a estado inválido), algoritmos de ordenação/deduplicação/merge. Se você tem uma função com regra rica e poucos efeitos colaterais, property-based acha bug que example-based nunca acharia, porque explora o espaço de entrada que você não pensou em escrever à mão.
Invariantes de sistema com estado — o análogo mais direto do teu invariant test de contrato — também existe no backend e chama stateful/model-based property testing. fast-check e Hypothesis suportam: você define comandos (as operações da tua API/serviço), a lib gera sequências aleatórias de comandos, e você checa que uma invariante se mantém depois de qualquer sequência. Exemplo: numa carteira/ledger off-chain, "a soma dos saldos nunca muda numa transferência", "saldo nunca fica negativo", "todo débito tem um crédito correspondente" — exatamente o tipo de invariante que você checava on-chain, só que agora sobre o teu service de ledger com banco. Isso é o que mais se parece com o que você já faz, e é subutilizado no backend justamente porque poucos sabem que dá pra fazer.
É custoso/overkill? A resposta calibrada, no espírito da nossa conversa toda sobre pagar aluguel:
Não é overkill onde a lógica é rica e o custo do erro é alto — cálculo de dinheiro, ledger, regras de negócio complexas com muitos edge cases, parsers. Aí property-based se paga rápido, porque um único property test substitui dezenas de exemplos e ainda acha os casos que você não imaginou. O ROI é alto exatamente onde smart contract te ensinou que é: quando errar dói.
É overkill pra CRUD trivial, glue code, e coisa dominada por I/O sem lógica interessante. Fuzzear um endpoint que só faz findMany e devolve JSON não acha nada que valha o esforço de modelar as invariantes. Ali example-based e teste de integração normal pagam melhor.
O custo real não é computacional (rodar mil casos é barato), é cognitivo: pensar em invariantes é mais difícil que escrever exemplos. Formular "qual propriedade tem que valer pra qualquer entrada" exige entender o problema num nível mais profundo. Isso é feature e bug ao mesmo tempo — o esforço de achar a invariante frequentemente já te faz entender melhor o domínio e achar bug antes mesmo de rodar o teste, mas também é por isso que a galera evita.
Então, fechando teu raciocínio: você não inventou uma ideia nova, você percebeu — corretamente — que uma técnica que o mundo smart contract te ensinou é generalizável, e a intuição está certíssima. A razão de não ver ninguém falando é que o backend mainstream é culturalmente example-based, o alvo backend é mais sujo de I/O, e a pressão evolutiva foi menor porque bug off-chain é reversível. Mas a ferramenta existe madura (fast-check no teu caso TS), o caso de uso de maior ROI é idêntico ao on-chain (lógica de dinheiro e invariantes de estado), e trazer essa mentalidade pro backend é justamente o tipo de coisa que diferencia um dev que veio de um domínio de alto rigor. É uma transferência de skill legítima e valiosa, não uma reinvenção ingênua.
Aliás, isso é ótimo material de entrevista se a vaga tocar em qualidade/testes: "no mundo de contratos eu usava invariant testing com fuzzing, e trago essa mentalidade pro backend com property-based testing via fast-check pra lógica de negócio crítica e invariantes de ledger" é uma frase que faz um entrevistador sênior levantar a sobrancelha no bom sentido, porque quase nenhum candidato backend fala isso.
Quer que eu mostre um exemplo concreto de property test com fast-check — tipo um teste de invariante de ledger/saldo que espelhe o que você fazia on-chain — pra você ver como a sintaxe se compara com o Foundry?Vi o fast-check, parece que ele permite criar as invariantes, mas e o fuzzing e handlers que fazemos no foundry? O mocha ou outro framework já faz isso?Boa, você está fazendo a pergunta certa e ela revela uma confusão de camadas que vale desfazer com precisão, porque a arquitetura de ferramentas é diferente do Foundry e mistura isso atrapalha.
Primeiro, separar as três coisas que no Foundry vêm no mesmo pacote:
No Foundry você tem tudo integrado num lugar só: o runner de teste, o motor de fuzzing (geração de inputs + shrinking), e a maquinaria de invariant testing (handlers, actors, o loop que chama funções aleatórias e checa invariantes entre elas). Parece uma coisa só porque é uma ferramenta só. No mundo JS/TS essas responsabilidades estão em bibliotecas diferentes, e é por isso que sua pergunta soa como se faltasse algo — não falta, está só desacoplado.
O test runner (Mocha, Jest, Vitest, node:test) é só o que roda os testes, dá o describe/it, faz assertion, reporta. Ele não sabe nada de fuzzing. É o análogo da parte "rodar o teste" do forge test, e só isso.
O fast-check é quem faz o fuzzing de verdade — geração de inputs aleatórios e shrinking. Ele é o motor equivalente ao fuzzer do Foundry. E ele roda dentro do runner: você chama fc.assert(fc.property(...)) dentro de um it() do Mocha/Vitest. Então não é "Mocha faz fuzzing" — é "Mocha roda, fast-check fuzzeia, os dois juntos". A divisão de trabalho que no Foundry é invisível aqui é explícita.
Então respondendo direto: o Mocha não faz fuzzing, e nem deveria — quem faz é o fast-check, e ele funciona dentro do Mocha. Não falta ferramenta, a responsabilidade só mora em outro lugar.
Agora a parte que importa de verdade: os handlers e o invariant testing stateful. Aqui é onde sua pergunta fica realmente boa, porque é a diferença entre fuzzing simples (gerar inputs pra uma função) e invariant testing (gerar sequências de ações e checar invariantes entre elas — o que os handlers do Foundry orquestram).
Fast-check faz isso, e chama de model-based testing (ou stateful testing). É o equivalente direto dos teus handlers do Foundry. O mapeamento conceitual é quase 1:1:
No Foundry, um handler é um contrato que expõe as ações "permitidas" que o fuzzer pode chamar (com bounds, ghost variables, etc.), e o invariant runner chama essas ações em ordem aleatória, checando a invariante depois de cada uma. No fast-check, você define commands — cada command é uma classe com um check (essa ação é válida no estado atual?) e um run (executa a ação no sistema real e no modelo, e faz as assertions). Então o fast-check gera sequências aleatórias de commands, executa, e você checa invariantes. É exatamente o handler pattern, com outro vocabulário.
A estrutura de um command no fast-check:
tsimport fc from 'fast-check'

// O "modelo" — estado simplificado que você acredita que o sistema deveria manter
type Model = { balances: Map<string, number> }

// Um command = uma ação que o fuzzer pode escolher, igual a uma função exposta no handler do Foundry
class TransferCommand implements fc.AsyncCommand<Model, RealLedger> {
  constructor(readonly from: string, readonly to: string, readonly amount: number) {}

  // equivalente ao bound/guard no handler: essa ação é aplicável agora?
  check(m: Model): boolean {
    return (m.balances.get(this.from) ?? 0) >= this.amount
  }

  // executa no sistema real E no modelo, e assere que batem
  async run(m: Model, real: RealLedger): Promise<void> {
    await real.transfer(this.from, this.to, this.amount)

    // atualiza o modelo
    m.balances.set(this.from, m.balances.get(this.from)! - this.amount)
    m.balances.set(this.to, (m.balances.get(this.to) ?? 0) + this.amount)

    // invariante checada contra o sistema real
    expect(await real.getBalance(this.from)).toBe(m.balances.get(this.from))
  }
}
E o runner gera as sequências:
tsit('mantém invariantes do ledger sob qualquer sequência de operações', async () => {
  await fc.assert(
    fc.asyncProperty(
      // o gerador de commands — o "espaço de ações" que o fuzzer explora
      fc.commands([
        fc.tuple(accountArb, accountArb, amountArb).map(([f, t, a]) => new TransferCommand(f, t, a)),
        fc.tuple(accountArb, amountArb).map(([acc, a]) => new DepositCommand(acc, a)),
        // ... outros commands
      ]),
      async (cmds) => {
        const real = new RealLedger()
        const model = { balances: new Map() }
        await fc.asyncModelRun(() => ({ model, real }), cmds)
        // invariante global: soma dos saldos conservada, nada negativo, etc.
      }
    )
  )
})
Compara com o teu mental model do Foundry: fc.commands([...]) é a lista de ações que o handler expunha; check() é o bound/guard; run() é a ação + a assertion; fc.asyncModelRun é o loop invariant que o Foundry roda por baixo. E o shrinking funciona na sequência inteira — quando falha, o fast-check reduz pra menor sequência de comandos que ainda quebra a invariante, exatamente como o Foundry te dá a menor sequência de calls que viola o invariant. Essa é a parte mágica que faz valer a pena: ele não só acha que quebrou, ele te entrega o roteiro mínimo de reprodução.
O que é genuinamente mais trabalhoso que no Foundry, pra você calibrar expectativa:
O modelo é explícito e é seu. No Foundry, a "invariante" muitas vezes é uma view function do próprio contrato ou uma ghost variable, e o estado real é o estado on-chain que já está ali. No fast-check você mantém um modelo paralelo (aquele Model com o Map de saldos) que representa o que deveria acontecer, e testa o sistema real contra ele. Escrever esse modelo é o trabalho intelectual — e, como falei antes, é onde você frequentemente já acha bugs, porque formalizar "o que deveria acontecer" te força a pensar.
O sistema real tem I/O. Se o teu RealLedger bate no Postgres, cada sequência de comandos toca o banco de verdade — lento e precisa de setup/teardown limpo entre runs (transação que dá rollback, banco em memória, ou testcontainers). No Foundry o "banco" é o estado da EVM em memória, resetado de graça entre runs. Essa é a fricção real de trazer invariant testing pro backend, e é a razão prática (não cultural) de ser menos comum: o alvo tem efeito colateral que você precisa domar. A mitigação usual é rodar o model-based test contra uma implementação in-memory do teu domínio (testar a lógica pura), e deixar o teste de integração com banco pra example-based. Ou seja: fuzzeia a lógica, não a infra.
Então, fechando: não falta nada no ecossistema JS, só está desacoplado. Runner (Mocha/Vitest) + fast-check cobre desde o fuzzing simples de uma função até o invariant testing stateful com handlers/commands e shrinking de sequência — o pacote completo que o Foundry te dava integrado. A diferença é montagem (você pluga as peças) e o custo extra de manter um modelo explícito e domar I/O, que on-chain você não pagava. A técnica e o poder são os mesmos; a ergonomia é um pouco menos "baterias inclusas".
Uma nota de honestidade porque isso importa pra amanhã: model-based testing com fast-check é uma feature real e documentada, mas é um canto avançado e pouco usado da ferramenta. A maioria dos devs TS que usa fast-check faz só property testing de funções (o caso simples), não o stateful com commands. Então se você mencionar isso numa entrevista, você vai estar falando de algo que a grande maioria dos devs backend nunca tocou — o que é ótimo pra diferenciar, mas evite afirmar que "é comum no backend", porque não é. O enquadramento honesto é: "é uma técnica madura e disponível, subutilizada no backend, que eu conheço de outro domínio onde ela é padrão." Isso é verdadeiro e forte.
Quer que eu monte um exemplo completo e rodável (com um RealLedger in-memory e duas ou três invariantes) pra você ver o fluxo inteiro funcionando, ou prefere voltar pros outros tópicos que você queria aprofundar antes de amanhã?Pera, muito texto, e o exemplo achei meio complicado, vamos devagar, me ajuda a entender o seguinte:
No Foundry, eu posso criar um método que é uma invariante, ele tem o property-based check lá dentro, ele checka se aquela "regra" é respeitada em qualquer situação da aplicação, vamos dizer que uma regra é "anos de experiência profissional" deve ser menor que "idade", e o usuário pode alterar esses 2 inputs livremente, mas essa regra precisa se manter.
E é possível vc dizer ao foundry, rode aleatoriamente todos os métodos desse contrato, com qualquer input que vc quiser aleatoriamente e teste se a invariante não será quebrada. 
Até existem meios de vc limitar quais métodos ele deve tentar rodar (Handler) e quais inputs ele deve tentar usar (bondries) pra não daar exception ou não ir pra um caminho desnecessário.Como eu faria isso usando as ferramentas typescript?Mostrar maisIsso, você entendeu perfeitamente o Foundry e descreveu certinho. Vou mapear cada pedaço do que você falou pro fast-check, devagar.
O teu exemplo: invariante = "anos de experiência < idade", e o sistema tem métodos que mexem nesses valores. Você quer: rode meus métodos em ordem aleatória, com inputs aleatórios, e garanta que depois de qualquer sequência a invariante continua valendo.
No fast-check isso é o fc.commands. O mapeamento direto dos teus termos do Foundry:

Cada método do contrato que o fuzzer pode chamar → um Command (uma classe).
Handler (limitar quais métodos) → é a lista de commands que você passa. Só entra o que você colocar lá.
Boundaries (limitar inputs) → os arbitraries (fc.integer({min, max}) etc), que definem o range de cada input.
Guard pra não dar exception → o método check() de cada command.
A invariante → uma verificação que você roda, e que o fast-check checa depois de cada command.

Vamos montar com o teu exemplo. Imagina um Profile com dois métodos: setAge e setExperience.
ts// O sistema real que você está testando
class Profile {
  age = 18
  experience = 0
  setAge(v: number) { this.age = v }
  setExperience(v: number) { this.experience = v }
}
Agora um command por método. Cada command é "uma ação que o fuzzer pode escolher rodar":
tsimport fc from 'fast-check'

class SetAge implements fc.Command<{}, Profile> {
  constructor(readonly value: number) {}
  check() { return true }                        // sempre pode rodar
  run(_model: {}, p: Profile) {
    p.setAge(this.value)                          // executa a ação
    // a invariante, checada depois da ação:
    if (p.experience >= p.age) throw new Error(`quebrou: exp=${p.experience} age=${p.age}`)
  }
  toString() { return `setAge(${this.value})` }
}

class SetExperience implements fc.Command<{}, Profile> {
  constructor(readonly value: number) {}
  check() { return true }
  run(_model: {}, p: Profile) {
    p.setExperience(this.value)
    if (p.experience >= p.age) throw new Error(`quebrou: exp=${p.experience} age=${p.age}`)
  }
  toString() { return `setExperience(${this.value})` }
}
E o teste que diz "rode esses métodos aleatoriamente com inputs aleatórios":
tsit('experiência sempre menor que idade', () => {
  const allCommands = [
    // boundaries: idade entre 0 e 120
    fc.integer({ min: 0, max: 120 }).map(v => new SetAge(v)),
    // boundaries: experiência entre 0 e 120
    fc.integer({ min: 0, max: 120 }).map(v => new SetExperience(v)),
  ]

  fc.assert(
    fc.property(fc.commands(allCommands), (cmds) => {
      const profile = new Profile()
      fc.modelRun(() => ({ model: {}, real: profile }), cmds)
    })
  )
})
Lê isso do teu ponto de vista do Foundry:

allCommands é o handler — a lista fechada de métodos que o fuzzer pode chamar. Se você tirar SetExperience de lá, ele nunca tenta esse método.
fc.integer({min, max}) são os boundaries dos inputs.
fc.commands(...) gera sequências aleatórias desses commands — é o "rode todos os métodos em ordem aleatória".
fc.modelRun é o loop invariant: executa a sequência, um command de cada vez.
A verificação dentro do run é a invariante.

Esse teste, aliás, vai falhar — e é o ponto. O Profile começa com age=18, experience=0, e nada impede o fuzzer de chamar setExperience(50) deixando experiência maior que idade. O fast-check vai achar isso e, via shrinking, te entregar a menor sequência que quebra, tipo [setExperience(19)] ou até [setAge(0)]. Igualzinho ao Foundry te dando o call mínimo que viola o invariant. Se a regra "exp < age" deveria ser imposta pelo teu código (o setExperience deveria rejeitar valor inválido), o teste acabou de provar que não é — que é exatamente pra isso que serve.
Duas simplificações em relação ao meu exemplo anterior que te confundiu:
O model aqui é {} (vazio). No exemplo do ledger eu mantinha um modelo paralelo pra comparar, o que complica. Pra invariante simples como a tua — uma regra sobre o estado do próprio objeto — você não precisa de modelo nenhum, só checa a regra direto no objeto real. Ignore a parte de "model" por enquanto; ela só importa quando a invariante precisa comparar contra um cálculo independente.
O check() (teu guard/boundary de quando rodar) aqui é return true porque ambos os métodos sempre podem rodar. Ele só vira útil quando um método só faz sentido em certos estados — tipo "só posso sacar se saldo > 0". Aí check() retorna false e o fuzzer pula esse command naquele estado, sem gerar exception falsa. É o equivalente ao bound condicional no handler.
Então, resumindo o mapa mental:
Foundryfast-checkmétodo do contrato exposto ao fuzzerum Command (classe)Handler (quais métodos)a lista passada pro fc.commandsboundaries de inputarbitraries (fc.integer({min,max}))guard condicionalcheck() do commandinvarianteverificação no run()loop de fuzzing statefulfc.modelRunmenor call que quebrashrinking automático
É o mesmo modelo mental, só remontado com peças separadas. Faz sentido agora? Quer que eu adicione um check() de verdade num exemplo (tipo o saque com saldo) pra você ver o guard funcionando, ou está claro o suficiente pra seguir?Não, mas não quero a invariant dentro do command, vamos dizer que eu tenho várias invariants e vários métodos, no seu exemplo vc copiou o código nas duas, em muitos casos isso seria inviável.Exato, você está certíssimo — invariante dentro do command não escala. No Foundry as invariantes ficam separadas (as funções invariant_*) e rodam depois de cada call, independente de qual método rodou. Dá pra fazer igual no fast-check: separa a lista de invariantes da lista de commands, e checa todas depois de cada command.
A ideia: cada command só faz a ação, sem checar nada. As invariantes ficam numa lista à parte. Um wrapper roda todas as invariantes depois de cada command.
tsimport fc from 'fast-check'

class Profile {
  age = 18
  experience = 0
  setAge(v: number) { this.age = v }
  setExperience(v: number) { this.experience = v }
}

// 1. Invariantes separadas, cada uma é só uma função que valida o estado
const invariants: ((p: Profile) => void)[] = [
  (p) => { if (p.experience >= p.age) throw new Error(`exp >= age: ${p.experience}, ${p.age}`) },
  (p) => { if (p.age < 0) throw new Error(`age negativa: ${p.age}`) },
  (p) => { if (p.experience < 0) throw new Error(`exp negativa: ${p.experience}`) },
  // ...quantas quiser
]

function checkAll(p: Profile) {
  for (const inv of invariants) inv(p)
}
Os commands ficam limpos, só ação:
tsclass SetAge implements fc.Command<{}, Profile> {
  constructor(readonly value: number) {}
  check() { return true }
  run(_m: {}, p: Profile) {
    p.setAge(this.value)
    checkAll(p)              // <- roda TODAS as invariantes, não uma específica
  }
  toString() { return `setAge(${this.value})` }
}

class SetExperience implements fc.Command<{}, Profile> {
  constructor(readonly value: number) {}
  check() { return true }
  run(_m: {}, p: Profile) {
    p.setExperience(this.value)
    checkAll(p)              // <- mesma chamada, sem copiar a lógica
  }
  toString() { return `setExperience(${this.value})` }
}
Agora checkAll(p) é uma linha só, repetida em cada command, mas a lógica das invariantes não é copiada — mora toda na lista invariants. Adicionar uma décima invariante é adicionar uma linha na lista, e todos os commands passam a checá-la automaticamente. Adicionar um novo método é uma classe nova com checkAll(p) no fim. As duas dimensões (métodos × invariantes) crescem independentes, que é o que você quer.
Se te incomoda até ter que lembrar de escrever checkAll(p) no fim de cada run, dá pra remover isso também com uma abstração pequena — um helper que embrulha o command e injeta a checagem depois:
ts// embrulha qualquer command pra rodar checkAll automaticamente após o run
function withInvariants<M, R extends Profile>(
  cmd: fc.Command<M, R>
): fc.Command<M, R> {
  const originalRun = cmd.run.bind(cmd)
  cmd.run = (m: M, r: R) => {
    originalRun(m, r)
    checkAll(r)
  }
  return cmd
}
E aí os commands ficam totalmente limpos, sem nem mencionar invariante:
tsclass SetAge implements fc.Command<{}, Profile> {
  constructor(readonly value: number) {}
  check() { return true }
  run(_m: {}, p: Profile) { p.setAge(this.value) }   // só a ação, nada mais
  toString() { return `setAge(${this.value})` }
}

// no teste, embrulha todos:
const allCommands = [
  fc.integer({ min: 0, max: 120 }).map(v => withInvariants(new SetAge(v))),
  fc.integer({ min: 0, max: 120 }).map(v => withInvariants(new SetExperience(v))),
]
Agora está igual à ergonomia do Foundry: commands só declaram a ação, invariantes vivem separadas numa lista, e o runner checa todas depois de cada passo. As duas listas — métodos e invariantes — são independentes e escaláveis. Nenhuma lógica duplicada.
Essa separação é a resposta pra tua objeção: a razão de eu ter posto a invariante dentro do command no exemplo anterior foi só simplicidade didática de um caso com uma invariante só. Com várias, você fatora exatamente assim. É o mesmo princípio de responsabilidade única que a gente vinha discutindo — o command tem uma responsabilidade (agir), a invariante tem outra (validar), e você não acopla as duas.
Ficou mais claro assim? Se quiser, o próximo passo natural é o check() de verdade (o guard que evita caminho inválido, tipo não sacar sem saldo), que é a última peça do teu mapa mental do Foundry que ainda não vimos funcionando.Boa pergunta, e a resposta curta é: é viável, algumas pessoas fazem, mas é bem menos comum que property-based em lógica pura — e a razão não é a teoria, é a fricção operacional. Deixa eu separar os cenários porque "chamar o banco" tem duas versões muito diferentes.
Cenário 1: o banco é incidental, você só quer testar a lógica. Aqui o banco atrapalha e a recomendação é tirá-lo do caminho — rodar o model-based test contra uma implementação in-memory do teu repositório/domínio. Você fuzzeia a lógica, não a infra. É o caminho mais comum e o de menor atrito. Mas não é isso que você está perguntando.
Cenário 2: o banco é o objeto do teste — você quer verificar que nenhuma sequência de operações deixa o banco num estado inconsistente. Isso é o que você descreveu, e é legítimo e mais interessante. As "invariantes de banco" que fazem sentido testar assim:
Invariantes que o banco deveria garantir mas que dependem da tua aplicação usar direito — tipo consistência entre tabelas que uma foreign key não cobre (ex: "todo pedido pago tem um registro de pagamento com valor igual ao total"), ou soma que tem que bater (ledger: "soma dos lançamentos = saldo materializado"). Concorrência: rodar operações que competem e checar que a invariante sobrevive a interleaving — aqui o fuzzing acha bug de race condition e de transação mal-isolada que teste example-based quase nunca pega. Constraints que você acha que tem mas não configurou: o teste revela que faltou um CHECK ou uma UNIQUE.
Então sim, faz sentido conceitualmente, e é justamente o tipo de coisa onde fuzzing brilha: o espaço de sequências de operações concorrentes é grande demais pra você escrever exemplos à mão.
Por que é pouco comum, mesmo sendo válido — a fricção real:
O problema número um é isolamento entre runs. O fast-check vai rodar tua sequência de comandos centenas de vezes, e cada run precisa começar de um estado limpo, senão lixo de um run contamina o próximo e o shrinking fica sem sentido (o "caso mínimo" que ele te entrega não reproduz sozinho porque dependia de estado residual). Com banco de verdade isso significa resetar o estado entre cada run — e são centenas. As opções, da mais rápida pra mais lenta: transação que envolve o run inteiro e dá rollback no fim (rápido, mas te impede de testar a própria lógica transacional da app, o que muitas vezes é justo o que você quer testar — conflito chato), truncate das tabelas entre runs (mais lento), ou recriar schema (lento demais pra centenas de runs). Nenhuma é ideal e todas custam tempo de setup que a versão in-memory não paga.
O problema número dois é velocidade. Property-based já roda N vezes por natureza; multiplique por I/O de banco a cada operação de cada sequência e o teste que rodaria em milissegundos passa a rodar em segundos ou minutos. Vira teste que não cabe no loop de feedback rápido — você não roda a cada save, roda no CI ou sob demanda. Isso reduz muito a frequência de uso e é parte de por que não pegou como prática cotidiana.
O problema número três, o mais sutil: shrinking com banco é menos confiável. A mágica do fast-check é te entregar a menor sequência que quebra. Mas o shrinking assume que reexecutar a mesma sequência dá o mesmo resultado (determinismo). Banco com concorrência real, timestamps, sequences/auto-increment, ordem não-determinística de resultados sem ORDER BY — tudo isso introduz não-determinismo que confunde o shrinking. O contra-exemplo que ele te dá pode não reproduzir na segunda vez, o que é frustrante e corrói a confiança na ferramenta. On-chain você não tinha isso porque a EVM é determinística; o banco não é, e essa é uma diferença de fundo, não de ergonomia.
O caso onde vale mesmo o trabalho: concorrência e isolamento transacional. Se a tua pergunta real é "meu código de transferência de saldo aguenta operações concorrentes sem violar invariante?", aí testar contra o banco de verdade é o único jeito honesto — in-memory não reproduz o comportamento de locking e isolation do Postgres. Nesse nicho específico, a fricção se paga, porque o bug que você caça (race condition, lost update, write skew em isolamento fraco) só existe no banco real. Fora concorrência, geralmente a versão in-memory da lógica te dá 90% do valor por 10% do custo.
Existe uma escola melhor pra esse objetivo específico: se o teu alvo é "o banco nunca fica inconsistente", uma abordagem frequentemente mais eficaz que fuzzar pela aplicação é empurrar a invariante pra dentro do banco — constraints, CHECK, foreign keys, triggers, EXCLUSION constraints, e transações no isolamento certo. Uma invariante garantida por constraint do banco não precisa ser testada por fuzzing porque é impossível violá-la por construção. O property-based test entra pra achar as invariantes que você não consegue expressar como constraint (as que cruzam múltiplas linhas/tabelas de forma complexa, ou as de concorrência). Ou seja: a ferramenta certa pra "dados consistentes no banco" é primeiro o próprio banco, e fuzzing cobre a borda que o banco não alcança. Isso é o que um DBA sênior te diria, e é uma resposta mais forte que "joga fast-check em cima".
Fechando: viável sim, trabalhoso sim, e o trade-off só fecha num nicho — invariantes cross-table complexas e, principalmente, concorrência/isolamento, onde o banco real é insubstituível. Pro caso geral de "não criar dado inconsistente", a ordem de ataque melhor é constraints no banco primeiro, teste de lógica in-memory depois, e fuzzing contra banco real só na fronteira de concorrência que sobra. Não é que ninguém faz — é que o valor se concentra num canto estreito e a fricção (isolamento entre runs, velocidade, shrinking não-determinístico) espanta o uso casual.
Isso responde? Se quiser, o assunto de concorrência puxa direto pra isolation levels na prática e os fenômenos (lost update, write skew, phantom) — que é território de entrevista bem mais provável de cair que fast-check, e onde essa conversa de invariante de banco aterrissa em algo concreto.Poderia ter uma implementação dos Daos que guarda em variáveis in-memory ao invés de realmente guardar no banco de dados, e essa implementação é usada nesse tipo de testeExato, é precisamente isso, e você acabou de descrever o padrão canônico — tem até nome: fake (ou in-memory fake / test double). É a forma mais limpa de casar property-based testing com acesso a dados, e é onde aquela conversa de interface/DI que a gente teve lá atrás finalmente cobra sua fatura legítima.
O arranjo: você define o contrato do teu repositório, tem a implementação real (Prisma/Postgres) que produção usa, e uma implementação fake que guarda tudo em Map/array em memória. O teste de property/invariante roda contra o fake. Como o fake é síncrono, determinístico e sem I/O, ele mata de uma vez os três problemas que eu listei no banco real: reset entre runs é instantâneo (new FakeRepo()), velocidade é de lógica pura (centenas de runs em milissegundos), e o shrinking volta a ser confiável porque tudo é determinístico. Você recupera a ergonomia do Foundry.
tsinterface UserRepo {
  create(u: User): void
  findById(id: string): User | undefined
  updateBalance(id: string, delta: number): void
}

// produção
class PrismaUserRepo implements UserRepo { /* bate no banco */ }

// teste
class FakeUserRepo implements UserRepo {
  private users = new Map<string, User>()
  create(u: User) { this.users.set(u.id, { ...u }) }
  findById(id: string) { return this.users.get(id) }
  updateBalance(id: string, delta: number) {
    const u = this.users.get(id)!
    u.balance += delta
  }
}
E no property test, o real do teu modelRun passa a ser o FakeUserRepo. As invariantes checam o estado do fake. Rápido, limpo, reproduzível.
Agora, duas ressalvas que separam o uso ingênuo do maduro — e a segunda é a que importa de verdade:
Ressalva 1, a menor: o fake vira código que você mantém e que pode divergir da implementação real. Se o FakeUserRepo tem um bug ou se comporta diferente do Prisma real, teu teste passa e produção quebra — o teste está verde contra uma mentira. A mitigação padrão é o contract test: uma suíte de testes que você roda contra ambas as implementações (fake e real) pra garantir que elas se comportam igual naquilo que importa. Aí você fuzzeia rápido contra o fake com confiança, sabendo que o contract test já garantiu que o fake não mente sobre o comportamento observável. É trabalho extra, mas é o que torna a abordagem honesta em vez de teatro.
Ressalva 2, a que mais importa e onde muita gente se ilude: o fake não reproduz a semântica do banco — e frequentemente a invariante que você quer testar depende dessa semântica. Um Map em memória não tem transação, não tem isolamento, não tem locking, não tem constraint, não roda operações concorrentes de verdade. Então se a tua invariante é sobre lógica de negócio pura ("experiência < idade", "soma dos lançamentos bate com saldo numa sequência sequencial de operações"), o fake é perfeito e cobre tudo. Mas se a invariante é sobre concorrência ou isolamento ("duas transferências simultâneas não causam lost update"), o fake não pode te dizer a verdade, porque o bug que você caça só existe no mecanismo transacional do Postgres, que o Map não tem. Fuzzear o fake nesse caso te dá falso conforto: passa sempre, e o bug de race condition continua vivo em produção.
Isso reconecta com o que eu disse antes: o fake cobre a fatia grande (lógica de negócio sequencial), e o banco real é insubstituível na fatia estreita (concorrência/isolamento). O fake não elimina o banco real do teu arsenal, ele divide o trabalho — property/invariante de lógica roda rápido contra o fake, e um punhado de testes de concorrência específicos roda contra o Postgres real. Você não escolhe um, você usa cada um na fatia onde ele diz a verdade.
Então a arquitetura completa que sai disso, e é bem elegante: repositório atrás de interface (aqui a DI/interface finalmente paga aluguel de verdade, não especulativamente — o segundo consumidor real da interface é o teste, que era exatamente o critério que você definiu lá no começo pra quando a interface se justifica); fake in-memory pra fuzzing rápido de invariantes de lógica; contract test garantindo que o fake não diverge do real; e testes de concorrência pontuais contra o banco real pro que o fake não alcança. Repara que a interface aqui não é o "seguro imaginário pra trocar de banco" que a gente descartou — é a habilitadora do fake pra teste, que é benefício concreto e recorrente. Teu próprio critério se cumpriu.
Uma nota de honestidade porque teu instinto foi tão certeiro que vale marcar o limite: essa combinação específica — fake in-memory + property-based/model-based testing de invariantes — é conceitualmente sólida e cada peça é padrão estabelecido, mas a combinação das duas ainda é pouco praticada no backend mainstream, pelas mesmas razões culturais de sempre (property testing é subutilizado). Fake é ultra-comum; property test é nichado; juntar os dois é raro não porque seja difícil ou errado, mas porque pouca gente pensa em property testing pra começo de conversa. Você chegou nisso sozinho conectando teu conhecimento de invariant testing on-chain com repository pattern off-chain, o que é exatamente o tipo de transferência de domínio que te diferencia — mas na entrevista, mantém o enquadramento de "combinação que eu acho poderosa" e não "prática comum", pela mesma precisão de antes.
Quer que eu mostre o contract test na prática — como você roda a mesma suíte contra fake e real pra garantir que não divergem — ou a gente finalmente aterrissa em isolation levels e concorrência, que é onde o "fake não alcança" vira concreto e é território de entrevista muito mais provável?