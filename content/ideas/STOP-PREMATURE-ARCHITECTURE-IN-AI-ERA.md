Gil: Me fala mais sobre MVC, clean architecture, hexagonal (ports & adapters)

Claude: Boa, esses três aparecem muito e é fácil se confundir. Vou destrinchar cada um e depois comparar.

MVC (Model-View-Controller)

Padrão mais antigo e conhecido, nasceu para UIs desktop e foi adaptado pra web.

Model: dados e regra de negócio. View: apresentação (no backend puro de API, muitas vezes é só a serialização JSON). Controller: recebe a requisição, coordena Model e devolve a resposta.

Na prática, em backend Node/Express, o "MVC clássico" quase sempre vira MVC + Service layer, porque colocar regra de negócio no Model engorda demais. Então fica: Controller (HTTP) → Service (regra) → Model/Repository (dados).

Limitação: MVC não diz nada sobre dependências e acoplamento. É fácil o Service chamar direto o ORM, o Controller conhecer detalhes de banco, e tudo virar um emaranhado. É organizacional, não arquitetural no sentido de proteger a regra de negócio.

Clean Architecture

Proposta pelo Uncle Bob. A ideia central é a regra da dependência: dependências apontam sempre para dentro, em direção à regra de negócio. Camadas concêntricas:

Entities (centro): regras de negócio mais puras e estáveis. Use Cases: regras da aplicação, orquestram entities. Interface Adapters: controllers, presenters, gateways (traduzem entre use case e mundo externo). Frameworks & Drivers (borda): Express, banco, ORM, APIs externas.

O ponto-chave: o núcleo (entities, use cases) não conhece Express, nem Postgres, nem nada de infra. A infra depende do núcleo, nunca o contrário. Isso é conseguido com inversão de dependência: o use case define uma interface (ex: UserRepository) e a camada de infra implementa. O use case só conhece a interface.

Benefício: você troca Postgres por Mongo, ou Express por Fastify, sem tocar na regra de negócio. Testabilidade alta (mocka a interface). Custo: mais boilerplate, mais arquivos, curva de aprendizado.

Hexagonal (Ports & Adapters)

Proposta por Alistair Cockburn, anterior à Clean e muito parecida em espírito. Metáfora: a aplicação é um hexágono no centro; tudo externo se conecta pelas bordas.

Ports: interfaces definidas pela aplicação. Dois tipos:

Driving/inbound ports: como o mundo externo aciona a app (ex: interface de um use case chamado por um controller HTTP ou por um consumer de fila).
Driven/outbound ports: o que a app precisa do mundo externo (ex: PaymentGateway, UserRepository).
Adapters: implementações concretas que plugam nos ports.

Driving adapters: controller REST, handler de fila, CLI — todos chamam o mesmo port de entrada.
Driven adapters: implementação Postgres do repository, cliente Stripe do gateway.
O grande insight: a mesma lógica de negócio pode ser acionada por HTTP, fila, CLI ou teste, e pode falar com qualquer banco/serviço, porque tudo passa por ports. A regra de negócio fica isolada no centro, agnóstica de tecnologia.

Comparação e como falar disso numa entrevista

Clean e Hexagonal são, na prática, muito próximas: ambas isolam a regra de negócio da infra usando inversão de dependência e interfaces. A diferença é mais de vocabulário e ênfase. Hexagonal foca na simetria entrada/saída (tudo é port/adapter). Clean adiciona uma estratificação mais detalhada em anéis. Muita gente usa "clean architecture" e "hexagonal" quase como sinônimos no dia a dia.

MVC opera num nível diferente: é um padrão de organização de código, não uma arquitetura que protege o domínio. Você pode ter MVC dentro da camada de adapters de uma app hexagonal.

Se te perguntarem qual usar, a resposta madura é: depende da complexidade. CRUD simples não precisa de hexagonal — o boilerplate não se paga e MVC + service resolve. Domínio complexo, regra de negócio rica, múltiplas fontes de entrada (HTTP + fila + cron), necessidade de trocar infra ou testar isolado: aí clean/hexagonal brilha. Over-engineering em app simples é um anti-pattern tão ruim quanto spaghetti em app complexa.

Um exemplo concreto que ancora bem: imagine um CreateOrderUseCase. Ele define os ports OrderRepository e PaymentGateway (interfaces). Não sabe se o pagamento é Stripe ou PayPal, nem se o banco é Postgres ou Mongo. Um controller REST e um consumer de fila Kafka podem ambos chamar esse use case. Nos testes, você injeta mocks dos dois ports e testa a regra pura sem subir banco nem servidor. Trocar Stripe por outro provedor é escrever um novo adapter, sem tocar no use case.

Quer que eu monte um esqueleto de pastas/código mostrando essas camadas num projeto Node concreto, ou prefere que eu faça perguntas sobre isso pra você treinar a explicação em voz alta?

Gil: Tá, eu já estudei isso e já apliquei, só havia esquecido o nome. Injeção de Dependências tem um limite, é mais comum eu ver um time que fez isso prematuramente e exageradamente do que eu ver um projeto que se salvou por ter isso, sinceramente.
Também tenho visto influencers criticando essas arquiteturas na era da IA, como vc vê isso?

Claude: Concordo com a tua observação empírica, e ela é mais comum do que o discurso arquitetural admite. A promessa "um dia você vai trocar o banco" quase nunca se realiza, e quando se realiza, as interfaces que você desenhou anos antes raramente encaixam na troca real, porque você abstraiu o que imaginou que ia variar, não o que de fato variou. O custo do boilerplate é pago todo dia; o benefício é uma opção que frequentemente expira sem ser exercida.

Onde DI/ports realmente se pagam, na minha visão, é mais estreito do que se vende: quando o adapter externo é lento, caro ou não-determinístico no teste (gateway de pagamento, envio de email, relógio, gerador de aleatório). Aí a interface existe pra testabilidade, não pra troca de infra, e esse benefício é real e recorrente. Trocar Postgres por Mongo é o exemplo que todo mundo cita e quase ninguém vive. Mockar o Stripe pra testar a regra de pedido é o que se faz toda semana. A justificativa boa é a segunda, não a primeira, e muito over-engineering vem de vender a interface pela razão errada.

Sobre os influencers: acho que tem um sinal real embrulhado em exagero de engajamento.

O sinal real: quando escrever código fica mais barato, o cálculo de custo/benefício de abstrações que existem pra "economizar mudança futura" muda. Camada de indireção que valia a pena quando reescrever custava um dia talvez não valha quando custa vinte minutos com IA. Abstração tem um custo de legibilidade que a IA não elimina — pelo contrário, indireção excessiva atrapalha tanto o humano quanto o modelo pra entender o que o código faz de fato. Nesse ponto eles têm razão, e é o mesmo argumento anti-over-engineering de sempre, só que com o limiar deslocado.

O exagero: "arquitetura morreu" é isca de clique. O que a IA barateou foi a digitação e parte da refatoração mecânica. O que ela não barateou é entender um sistema, decidir onde ficam os limites (boundaries), e conter o raio de explosão de uma mudança. Numa base grande, o valor de clean/hexagonal nunca foi principalmente "trocar o banco" — foi conter acoplamento pra que uma mudança não vaze por cinquenta arquivos. Isso importa mais com IA no loop, não menos, porque agora você gera código mais rápido do que consegue revisar, e limites ruins deixam o modelo (e você) fazer estrago numa velocidade maior. Boundaries são compressão: um port bem posto é um contrato que deixa você (ou o agente) raciocinar sobre um pedaço sem carregar o resto na cabeça.

Onde eu aterrisso: o teste continua sendo "essa abstração está pagando aluguel?". A IA move o limiar — abstração especulativa fica mais cara em relação ao benefício, então o default deve pender mais pra código direto e concreto. Mas ela não zera o valor de limites bem escolhidos numa base que várias pessoas (e agentes) tocam. Provavelmente o quadrante que mais muda é o CRUD médio, onde antes se justificava um pouco de cerimônia "por via das dúvidas" e agora não se justifica mais. O domínio complexo com regra de negócio rica ainda quer seus boundaries.

Numa entrevista, se isso vier à tona, a resposta que soa sênior não é escolher um lado, é mostrar que você aplica o teste caso a caso e sabe distinguir a abstração que se paga (isolar o não-determinístico pra testar) da que é seguro imaginário (interface pra troca que nunca vem). Isso te posiciona acima tanto do fanático por clean architecture quanto do influencer que declarou a morte dela.

Curioso: os influencers que você viu estão argumentando mais na linha "IA deixa reescrever barato então não abstraia", ou na linha "só deixa a IA gerar e não se preocupe com estrutura"? Porque a segunda é bem mais frágil que a primeira.

Gil: Esse seu exemplo do Stripe é real, mas não sinto que preciso de Clean Architecture ou Hexagon pra isso. Eu simplesmente preciso notar a necessidade pontual e reorganizar o código pra superar essa demanda. Em algum momento eu vou ter que escrever os testes e vou notar que vou precisar mockar, peço pra IA fazer essa refatoração (que invevitávelmente vai ser early, pq o teste vem early) e bola pra frente.

Claude: Exato, e isso é a distinção que desmonta boa parte do discurso pró-arquitetura: injeção de dependência como técnica pontual é diferente de Clean/Hexagonal como arquitetura adotada de cima pra baixo. Você não precisa da segunda pra ter a primeira. Extrair uma interface no ponto onde o teste dói é uma refatoração local, barata e reversível. Adotar a arquitetura inteira é comprometer o projeto todo com um formato antes de saber onde a dor vai aparecer.

O que a arquitetura-como-doutrina vende é justamente pular a etapa do "notar a necessidade": desenhar todos os ports na frente pra não ter que refatorar depois. E é aí que ela erra, porque o custo que ela tenta evitar — a refatoração — é o barato da equação, e o custo que ela impõe — cerimônia em cima de código que talvez nunca precise dela — é o caro. Você inverteu isso corretamente: refatora quando a demanda aparece, e a demanda aparece cedo justamente porque o teste vem cedo. O teste é o que revela onde o boundary se paga, então você deixa ele te dizer, em vez de adivinhar.

O ponto sobre IA fecha bem: quando o custo da refatoração cai (a IA extrai a interface e reconecta as chamadas em minutos), o argumento "abstraia antes pra não pagar a refatoração depois" perde ainda mais força, porque o "depois" ficou barato. O YAGNI fica mais forte, não mais fraco, quando o Y ("you aren't gonna need it") pode ser corrigido rápido no dia em que você precisar. A abstração especulativa só se justificava quando refatorar era caro e arriscado; tira isso da conta e o default correto é adiar até a evidência chegar.

A única ressalva que eu colocaria — e é mais nuance do que discordância — é que "reorganizar quando a necessidade aparece" pressupõe que você consiga notar a necessidade e que a refatoração seja de fato local. Isso vale enquanto o acoplamento não vazou longe. Se você deixou o stripe.charge() espalhado por quinze lugares antes de escrever o primeiro teste, a refatoração deixa de ser pontual. Na prática você já cobre isso escrevendo teste cedo, que força o boundary a aparecer enquanto ele ainda é pequeno. Então não é "não pense em estrutura", é "deixe o teste e o uso real revelarem a estrutura em vez de decretá-la no dia zero". Disciplina de refatoração contínua no lugar de arquitetura especulativa. Some IA barateando o passo de refatorar e essa abordagem fica ainda mais defensável.

Numa entrevista, se alguém tentar te encurralar com "mas e a Clean Architecture?", essa é uma resposta forte: você não rejeita os princípios (inversão de dependência, isolar o não-determinístico, conter acoplamento), você rejeita aplicá-los especulativamente. Distingue o princípio da cerimônia. Isso é difícil de atacar porque você não está sendo o cowboy sem testes nem o arquiteto astronauta — está no meio defensável, guiado por evidência.

Gil: Ah sim, por isso eu gosto de separar as responsabilidades, e isso não tem a ver com interface. É simplesmente um Helper único que lida com coisas de Stripe, todo mundo chama ele, que abstrai a tecnologia. Ele não tem lógica de negócio, só simplifica o código da nossa necessidade de se conectar com o Stripe. E isso é muito mais fácil de fazer do que meter interface pra todo lugar. Veja bem, eu gosto muito de interface, adoro o padrão "command", mas quando se é experiente, é muito fácil notar quando realmente é necessário.

Isso, e o que você descreveu tem nome mesmo que você não use o rótulo: é um wrapper/gateway concreto por colocação, não por contrato. A tecnologia fica confinada num único módulo, todo mundo passa por ele, e o resto do código não sabe fazer chamada de Stripe. Você ganha 90% do benefício que a arquitetura promete — um único ponto de mudança, resto do código agnóstico — sem o imposto da interface. A interface só acrescenta uma coisa em cima disso: poder substituir a implementação sem tocar no chamador. Se você não tem essa necessidade (segunda implementação real, ou mock que não dá pra fazer de outro jeito), a interface é peso morto. O helper concreto já te deu o encapsulamento; a interface só te daria a polimorfia, que é o que você frequentemente não precisa.

E tem um detalhe técnico que reforça teu ponto no ecossistema JS: você nem precisa de interface pra mockar. vi.mock/jest.mock intercepta o módulo inteiro no nível do import. Então o argumento "preciso da interface pra testar" — que já é fraco — é ainda mais fraco em Node, porque a ferramenta de teste mocka o helper concreto direto, sem você ter abstraído nada. Em linguagem de tipagem nominal mais rígida (Java, C#) a interface às vezes é o único caminho pro mock; em JS/TS não é. Boa parte do reflexo pró-interface é bagagem cultural importada de linguagens onde ela era obrigatória por razões que não se aplicam aqui.

O ponto sobre command também está certo e vale afiar pra entrevista, porque mostra que você não é anti-abstração, é anti-abstração-especulativa. Command se paga quando você precisa reificar a ação — enfileirar, dar undo, logar/auditar, repetir, serializar pra mandar pra um worker. Aí o benefício é concreto e recorrente: a ação virou um objeto que você pode passar adiante no tempo e no espaço. Usar command só pra "organizar" uma chamada síncrona que nunca vai pra fila é o mesmo erro da interface especulativa, com outro rótulo. A régua é idêntica em todos esses casos: a abstração está reificando algo que você de fato manipula (troca de impl, ação no tempo), ou está só adicionando uma camada porque um padrão mandou?

E você nomeou a variável que fecha tudo: experiência. A diferença entre júnior e sênior aqui não é saber os padrões — o júnior às vezes sabe mais nomes de padrão, fresquinhos do curso. É o senso de quando o padrão paga aluguel. Isso não se ensina em diagrama, se calibra apanhando: você aplicou clean architecture num CRUD, sofreu o boilerplate sem colher benefício, e recalibrou. O influencer anti-arquitetura e o astronauta pró-arquitetura têm o mesmo defeito na verdade — os dois aplicam uma regra fixa em vez de ler o caso. Um decreta sempre, o outro decreta nunca. Você está dizendo "depende, e eu sei ler de qual lado o caso cai", que é a única posição que sobrevive ao contato com projeto real.

Se isso vier numa entrevista, esse é o enquadramento que te posiciona como sênior sem soar arrogante: você tem as ferramentas todas na caixa — interface, command, gateway, DI — e a competência é escolher, não aplicar por reflexo. Encapsulamento você quer quase sempre (o helper concreto). Polimorfia e reificação você adiciona quando o caso pede. Distinguir esses dois eixos é exatamente o que separa quem leu o livro de quem rodou o código.