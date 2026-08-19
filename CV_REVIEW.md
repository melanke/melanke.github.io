# Revisão dos CVs — parsing automatizado (ATS) e leitura de RH

Revisão dos 5 PDFs em `public/documents/`, feita extraindo o texto como um ATS faria
(`pdftotext` com e sem `-layout`), conferindo metadados/fontes/ordem de leitura, e
cruzando com o código-fonte que gera os PDFs.

**Data:** 14/08/2026 · **Versões analisadas:** general, web3, leader, enterprise, product

**Atualizado em 19/08/2026** — 6 versões agora (entrou `webdev`), e a versão `leader`
passou a ser publicada como **Technical Project Manager** em `/project-manager`. Os
gaps que sobraram desta revisão foram movidos para `content/career-gaps.md`, que
separa "nunca usei" de "usei e enferrujou" de "tenho mas não registrei".

**O que já está bom:** fontes embutidas com mapa Unicode, zero texto em imagem, o texto
extrai limpo e na ordem certa. A base do PDF é sólida — os problemas são de conteúdo,
estrutura e campos ausentes.

**Legenda:** ✅ corrigido · 🟡 parcial · ⬜ pendente

---

## 1. Parsing automatizado (ATS)

### Bloqueadores

#### ✅ Nome, cargo e localização colados numa linha só
`components/Header.tsx`

A extração crua devolvia a primeira linha como `Gil Bueno Principal Software Engineer`,
sem separador. ATS que faz *name extraction* pela primeira linha gravaria o candidato
como "Gil Bueno Principal Software Engineer". No layout preservado ainda grudava o
`UTC-3` no fim.

**Corrigido:** separador `·` entre nome e cargo, ambos em `text-2xl` (nome bold, cargo
regular). A primeira linha agora extrai como `Gil Bueno · Principal Software Engineer`
nas 5 versões.

> **Nota técnica para futuras edições:** o separador precisa ficar num tamanho de fonte
> próximo ao do texto ao redor. Testado: a 24px (`text-2xl`) e a 48px agrupa corretamente
> na mesma linha extraída; a 16px o glifo cai num text run separado e o extrator o emite
> como linha solta em outro lugar do documento — exatamente o que aconteceria com o
> antigo `text-sm` da localização.

#### ✅ Sem telefone
Nenhum dos 5 tinha. Vários ATS marcam o perfil como incompleto, e portais com campo
obrigatório (Workday, Greenhouse) forçam preenchimento manual — atrito que derruba
conversão.

**Corrigido:** `+55 11970629099` como último item da linha de contatos, com link
`tel:+5511970629099` embutido como anotação real no PDF (verificado nos 5).

#### ✅ Sem localização parseável
"UTC-3" sozinho não é parseável como local por nenhum ATS: filtro por país/cidade/região
não encontra o candidato. `app/layout.tsx` já usava `"Sao Paulo, Brazil"` em
`metadata.other` — os dois estavam divergentes.

**Corrigido:** `Sao Paulo, Brazil (UTC-3)` como terceiro campo da primeira linha, após um
segundo separador `·`. Valor unificado nos 4 call sites (`ResumePage`, `not-found`,
`blog/page`, `blog/[slug]`).

#### ✅ "English" não aparecia nenhuma vez em nenhum dos 5 PDFs
`components/ResumePage.tsx` definia `languages: "English and Portuguese"` e o
`Header` recebia a prop mas **nunca a renderizava** (o mesmo ainda vale para
`education`). Para brasileiro aplicando em vaga remota internacional, idioma é um dos
filtros mais comuns que existe.

**Corrigido:** `LANGUAGES: English (C2), Portuguese (Native)` como última linha do bloco
de skills, e o heading virou `Skills` (de "Technical Skills") para comportar a linha.
Custo: uma linha. A prop `languages` do `Header` segue sem uso e pode ser removida.

#### ✅ Sem heading "Skills" / "Technical Skills"
Os blocos apareciam como "Backend", "Web Frontend", "AI Engineering", "Blockchain"
soltos, sem seção-pai. ATS popula o campo de competências procurando o header canônico;
sem ele, esses blocos são descartados ou interpretados como entradas de experiência.

**Corrigido:** heading `Technical Skills` no print, no mesmo estilo de "Notable
Achievements" e "Work Experience", com as categorias rebaixadas a rótulo inline
(`BACKEND: Node.js (2012), ...`). A tela mantém os headings com ícone e as pills.

#### ✅ Sub-projetos da Simpli são lidos como empregadores separados
Neon Wallet, LDC, Jamef, iTrack, Apptite, Multilaser e Enclave entram com nome + cargo +
intervalo próprio, no mesmo formato das empresas de topo. Nenhum ATS entende a
indentação. Resultado: 7–8 "empregos" com datas sobrepostas (Jamef Jun/2019–Mai/2022
cruza LDC, Neon e Simpli). Dispara flag de sobreposição, quebra o cálculo automático de
anos de experiência, e no parse cru parece job hopping.

**Sugestão:** prefixar com o empregador, ex. `Simpli — client project: Jamef`.

### Médios

| # | Problema | Onde |
|---|---|---|
| ✅ | **Formato `Java (2008)`** é ambíguo — parser e leitor apressado leem como *última vez usado em 2008*. `since 2008` ou `18 yrs` elimina a leitura errada | `SkillSection.tsx` |
| ✅ | **"Academic Qualifications"** em vez de "Education" — parsers de seção mais simples não reconhecem | `Timeline.tsx:242` |
| ✅ | **"Gil Bueno" no PDF vs "Gil Lopes Bueno"** no nome do arquivo e no metadata Title. Divergência com documento/LinkedIn atrapalha deduplicação e background check | `ResumePage.tsx` |
| ✅ | **Metadata do PDF enterprise estava errado.** Eram dois pontos, não um: `metadata.title` em `app/enterprise/page.tsx` (vira o `Title` do PDF) e o branch ausente em `ResumePage.tsx` (vira o cabeçalho impresso). Ambos agora dizem "Principal Backend Engineer" | `app/enterprise/page.tsx`, `ResumePage.tsx` |
| ⬜ | **Achievements em grid de 2 colunas:** na extração crua sai a coluna esquerda inteira e depois a direita, quebrando o pareamento. Coluna única extrai melhor | `Achievements.tsx` |
| ✅ | **PDF não era tagged e o HTML não tinha heading nenhum.** Headings semânticos aplicados e `tagged: true` no `page.pdf()` — `Tagged: yes` nos 5. Ver apêndice: a tela não tinha `h1` algum, e ele duplicava no print | `scripts/print-cv.mjs` + componentes |
| ✅ | **`&` e espaços no nome do arquivo.** Renomeados para `Gil-Lopes-Bueno-<Cargo>.pdf`. ⚠️ Os nomes antigos deixaram de existir: link direto já compartilhado dá 404 | `scripts/print-cv.mjs`, `ResumePage.tsx` |

### Sobre texto invisível (avaliado e descartado)

Foi testada a possibilidade de um separador invisível que só o ATS leria. Conclusões:

- O truque óbvio (`<span style="color:transparent">|</span>` entre os elementos)
  **não funciona**: o caractere entra na camada de texto mas o extrator o joga para
  outro bloco. Só funciona dentro do mesmo text run.
- Como os PDFs saem do print do site, qualquer coisa invisível **também fica no HTML
  público** de gil.solutions — detectável em view-source e por screeners LLM.
- A versão invisível não dá **nenhum** ganho de parsing sobre a visível — só o risco.
  Quem encontra texto escondido num currículo raramente avalia a intenção; a associação
  imediata é keyword stuffing.

**Canal invisível legítimo:** metadata do PDF (`Author`, `Subject`, `Keywords`). Testado:
o Chrome **ignora** `<meta name="author">` — o PDF sai sem campo `Author`, só com `Title`
(vindo do `<title>`). Popular esses campos exigiria pós-processamento no
`scripts/print-cv.mjs` com `pdf-lib` (~10 linhas, dev dependency). Aproveitaria para
corrigir de quebra o `Title` errado do PDF enterprise.

---

## 2. Erros factuais e de consistência

| # | Problema | Onde |
|---|---|---|
| ✅ | **"60k delivery mans"** — inglês errado, nos 5 PDFs. O próprio bio usa "60,000 couriers" duas linhas acima | `Achievements.tsx:38` |
| ✅ | **33Labs em "Sep 2025 - current" descrito no passado.** Reescrito em *present perfect* ("I've worked on", "has given me") nas 5 versões: lê certo agora, como ação em curso, e continua certo depois que ele sair. O `enterprise` usava presente simples e tinha o problema inverso — quebraria na saída — então entrou na mesma correção | `content/timeline-items.ts` |
| 🟡 | **Sharity e Desabafa citados nos Achievements sem entrada que os sustente.** Resolvido em 3 das 5: Sharity entrou em general/leader/product, Desabafa em leader/product. Em **enterprise e web3 o gap continua** — não coube (a descrição do Sharity não cabe nos 112pt livres do enterprise) | `timeline-items.ts` |
| ✅ | **Enterprise: Enclave Wallet (Jun 2024) listado por último**, depois de Multilaser (2014). Resolvido separando as ordens por mídia — ver apêndice | `Timeline.tsx` |
| ✅ | **Enterprise e Product: COZ (Jun 2022) depois de Simpli (Out 2013)** — mesma causa e mesma correção | `Timeline.tsx` |
| 🟡 | **"19+ years" não fecha com o papel.** Pior do que registrado: em leader/product/web3 o SIMET não imprimia, então o papel mostrava **13 anos**. Agora o SIMET imprime nas 5 (descrição curta onde faltava espaço) → 16 anos; e a entrada `FingerPrint, Escala, NetStartup (2007-2010)` cabe só no enterprise → 19 anos. **Faltam 3 anos em 4 das 5 versões** | `timeline-items.ts` |
| ✅ | **Desabafa: "700k posts" vs "over 1 million interactions".** A timeline passou a dizer "reaching 700 thousand posts", batendo com os Achievements | `timeline-items.ts` |
| ✅ | **"Runin Multilaser" vs "Multilaser Runin"** — nome invertido entre as duas seções. E "Desabafa - 700k" usa hífen enquanto os outros usam en dash | `Achievements.tsx` |
| ✅ | **Anacronismos no bloco "Other"** (site, telas xl+): React Native "since 2011" (lançado 2015), Figma "since 2011" (2016), Adobe XD "since 2011" (2016). O commit `f341be5` corrigiu isso na timeline mas não aqui | `OtherSection.tsx:5-8` |
| ❌ | ~~**Web3: buraco de Jun–Ago/2026.**~~ **Alarme falso meu.** Os projetos sem cobertura são *filhos* do 33Labs, que é o vínculo e está "Sep 2025 - current". Não há buraco de emprego nenhum | — |
| ✅ | **Skills não batiam com os projetos.** Redis, ECS, S3, SNS, SQS e Terraform entraram no bloco Backend das 5 versões. Terraform não existia em `technologies.ts` — foi criado e ancorado em 11 projetos com infra AWS (ver ⚠️ no apêndice sobre o ano de início) | `ResumePage.tsx`, `lib/technologies.ts` |
| ✅ | **Bloco Backend mais fraco fora do enterprise.** Microservices, Distributed Systems, Solution Architecture, CI/CD e GitHub Actions agora aparecem nas 5 versões — as palavras de arquitetura deixaram de faltar justamente no CV "principal" | `ResumePage.tsx` |

---

## 3. Leitura de RH por tipo de vaga

### ✅ Dev web tradicional (React/Node) — não existia versão, e era a que mais fazia falta

Recruiter abria o `general` e lia "Principal Software Engineer · AI-driven backends · DeFi
· $1B em volume · ex-CTO · co-founder". Reação padrão: caro demais, sênior demais, vai
embora em 6 meses, e "isso não é vaga de web dev".

**Corrigido: 6ª versão criada em `/webdev`**, título "Senior Full-Stack Engineer" (sem
"Principal"). Bio reescrita liderando com React/Next.js/TypeScript/Node.js, sem abrir com
CTO/co-founder/DeFi. Skills reordenados front-first (`Web Frontend` → `Backend` → `AI
Engineering`), Blockchain mantido só na tela (`print:hidden`) como evidência de range sem
gastar orçamento de página. PDF gerado em 3 páginas, mesmo padrão dos outros 5.

Jamef (8s → poucos ms, dashboard complexo) e LDC (form engine configurável) — já
enquadrados como vitórias de front — viraram prioridade 1 e entram no PDF. Wow Talents,
Mapix, Apptite, Desabafa, Band Radios e Multilaser Runin subiram para prioridade 1 na
tela. SIMET-NIC.br (migração de Java Applet para JS puro) subiu de 2→2 mas ganhou entrada
própria no PDF. Enclave e Neon Wallet tiveram descrição própria para `webdev`, reduzindo
jargão DeFi e nomeando a stack (React/Next.js/Node, React Native/Electron) sem esconder
que são produtos de carteira. 33Labs (emprego atual) reaproveita o texto já usado no
`enterprise`, com framing de backend services em vez de "DeFi protocols". Projetos
puramente de protocolo/DeFi (American Spend, Mosaic, BuidlGuidl, Jodobix, COZ, Letter,
NDapp, BSLib) ficaram invisíveis nessa versão — ruído para esse público.

Arquivos: `app/contentVersion.ts`, `app/webdev/page.tsx` (novo), `app/sitemap.ts`,
`scripts/print-cv.mjs`, `components/Bio.tsx`, `components/ResumePage.tsx`,
`content/timeline-items.ts`.

**Ainda faltam** (não bloqueiam, mas ficam registrados): React 18/19, RSC, App Router,
Server Actions, acessibilidade, Core Web Vitals como skills nomeadas — nenhum projeto na
timeline documenta essas features especificamente, então não entraram sem inventar uso.
Se algum projeto realmente usou App Router/Server Actions, é uma adição futura em
`lib/technologies.ts` + o `technologies` do item correspondente.

### 🟡 Web3 — a versão mais forte

Uniswap v3/v4 hooks, bonding curve, CLOB, prediction market com vault, mentoria
BuidlGuidl, $1B em volume: material de primeira.

**Riscos avaliados um a um:**
- **"8+ years in Web3" infla o tempo de protocolo real.** ⬜ Decisão: manter como está —
  é tecnicamente verdade (conta wallet/SDK), e reescrever a frase para separar "anos em
  Web3" de "anos em protocolo Solidity" foi avaliado e descartado por ora.
- ✅ **`Foundry (2025)` chamava atenção isolado.** É dado real — Foundry só entrou com o
  33Labs em set/2025, antes disso era Hardhat (since 2020). Os dois já co-existiam no
  mesmo bloco Blockchain, mas `Hardhat` estava no fim do array de skills, longe de
  `Foundry`. Reordenado para ficar logo antes (`Solidity → Hardhat → Foundry`), reforçando
  a leitura de evolução de tooling em vez de adoção recente — sem inventar nenhum dado
  novo. `components/ResumePage.tsx` (`blockchainSection` e `web3IntegrationSection`).
- ⬜ **Nenhuma prova pública de código Solidity.** O único link de GitHub é o BSLib, que é
  TypeScript. Falta contrato verificado, relatório de auditoria, repo. Sem ação por ora —
  não há código público disponível para linkar (trabalho de cliente/NDA).
- ✅ **O passado em "Sep 2025 - current" pesa mais aqui do que em qualquer outra versão** —
  avaliado e confirmado que é leitura correta, não bug: é o CV que vai pra recrutador de
  protocol engineering, e o emprego atual sendo 100% DeFi reforça a candidatura em vez de
  atrapalhar. Sem mudança.

### ✅ Tech Lead / Engineering Manager — maior gap estrutural

`components/ResumePage.tsx` dava ao `leader` exatamente a mesma lista de skills do
`general`: Backend, AI, Frontend, Blockchain. **Zero vocabulário de liderança no bloco de
skills.** Existia um `productSection` construído para o Product; não existia o equivalente
de liderança.

**Corrigido: bloco `Leadership` novo**, espelhando o `productSection` — 12 competências
com `since` (People Management, Hiring, Team Building, Mentoring & Coaching, Delegation,
Technical Roadmap, Stakeholder Management, Performance Management, 1:1s, Cross-functional
Leadership, Agile Delivery, Engineering Standards), liderando a ordem no `leader` (mesmo
padrão de posicionamento que o Product usa). Para caber no orçamento de 3 páginas — o
`leader` já era a versão mais apertada — o bloco Blockchain passou a `print:hidden` nessa
versão (fica só na tela, como range evidence), mesmo tratamento que o `product` já dava.
`components/ResumePage.tsx`.

> O `CLAUDE.md` descrevia um `LeadershipSection.tsx` que não existe no repo — doc
> desatualizada, não corrigida aqui (fora do escopo desta revisão).

**Outros pontos:**
- Únicas métricas de gestão: "30 devs, 5 team leads". Sem contratação, retenção, ciclo de
  performance, orçamento, 1:1s, ritual ágil. ⬜ Não resolvido — o bloco novo dá o
  vocabulário, mas não inventa métricas que não existem nos dados da timeline.
- ✅ **"Toda a liderança foi na própria empresa" — não é bem assim.** Gil também liderou em
  hierarquia alheia: **COZ** (convidado para o board de diretores do grupo, já aparecia
  como prioridade 1 no `leader` e imprime no PDF) e a fusão **Sharity→Abacashi** ("invited
  to lead the engineering side of that merger", dentro da entrada Sharity, que também
  imprime). O **BuidlGuidl** (mentoria de devs externos) subiu de prioridade 2→1 no
  `leader` para aparecer na tela junto dos outros dois — não entra no PDF porque o
  orçamento de página não permitiu mais uma entrada de timeline sem estourar as 3 páginas.
- O parágrafo explicando por que o papel atual é IC está muito bem escrito e resolve a
  maior objeção; o resto não acompanha. ⬜ Não revisitado nesta rodada.

### ✅ Project Manager — resolvido reaproveitando o `leader`

O Product era o mais próximo mas não servia. PM quer cronograma, orçamento, gestão de
risco, gestão de fornecedor, Gantt, Jira.

Contagem nos 5 PDFs de 14/08: `Jira` = 0 · `Agile` = 0 · `Scrum` = 0 · `Kanban` = 0 ·
`Certif` = 0.

**Corrigido em 19/08 sem criar uma sétima versão.** Como a frente de Engineering Manager
foi descartada, a versão `leader` foi republicada como **Technical Project Manager**:
rota `/project-manager` (com `/leader` ainda servindo a mesma página), PDF
`Gil-Lopes-Bueno-Technical-Project-Manager.pdf`, título e metadata trocados, e bio
reescrito para delivery end-to-end — escopo, proposta, estimativa, cronograma, orçamento,
horas, custos e risco, com o ClickClock como exemplo de melhoria operacional que nasceu
de uma dor de gestão. `leader` segue como identificador **interno** para não ter que
reescrever todas as entradas da timeline de uma vez.

O bloco `Leadership` virou `Project Management` e absorveu o vocabulário da vaga: Project
Delivery, Scrum, Kanban, Sprint Planning, Backlog Refinement, Estimation & Proposals,
Project Scheduling, Budget Management, Risk Management, Stakeholder Management, e as
ferramentas com data real — Jira (2010), YouTrack (2016), ZenHub (2020), ClickUp (2022),
Linear (2025). As competências de pessoas que valem para TPM (People Management,
Mentoring & Coaching, Cross-functional Leadership, Performance Management 2022, 1:1s
2022) entraram **no mesmo bloco** em vez de virar seção própria: um heading custa ~5
linhas do orçamento de 3 páginas, quatro pills custam 1. ClickClock subiu para prioridade
1 e passou a imprimir nessa versão.

⬜ **O que continua faltando:** certificação (`Certif` segue = 0), Gantt/caminho crítico,
gestão de fornecedor, e qualquer métrica de delivery (previsibilidade, throughput, lead
time). Detalhado em `content/career-gaps.md` §2.3 — PSM I é apontado ali como o item de
maior ROI da trilha.

### Product Owner — boa base, credibilidade frágil

O bloco Product é bem construído e o bio é o melhor escrito dos cinco.

**Problemas:**
- `Discovery (2010)` e `Requirements (2010)` num período em que ele era engenheiro júnior
  lê como inflação, e contamina a credibilidade do resto do bloco.
- **Métricas não são de produto.** GMV, volume transacionado, invoices são números de
  escala, não de produto. Falta retenção, ativação, conversão, A/B test, NPS, e qualquer
  ferramenta de analytics (Amplitude, Mixpanel, GA). PO é cobrado em outcome, não output.
- Zero Scrum/Agile/refinement/sprint — o vocabulário cerimonial que a vaga usa.
- O cargo mais recente no topo do CV é "Principal Engineer | Smart Contract Engineer". O
  parágrafo de justificativa é bom, mas a primeira linha lida contradiz o título do documento.

### Dev enterprise — maior gap de keyword

O bio (Java, Kotlin, distribuídos, 50M+ invoices, SaaS) está certo. O bloco de skills sabota.

**`Spring` = 0 ocorrências nos 5 PDFs.** É a keyword nº 1 de vaga Java enterprise.

Também zerados: Hibernate/JPA, Kafka, Kubernetes, JUnit, Mockito, Testcontainers,
RabbitMQ, gRPC, observabilidade (Datadog/Grafana/OpenTelemetry), SOC2/GDPR/LGPD/ISO.
Terraform só existe em prosa.

O que está lá — `Jersey (2020)`, `JDBC (2020)`, `C# (2018)`, Xamarin — lê como stack
datado, e Jersey/JDBC crus sugerem que ele não usou framework moderno de JVM.

> Se ele realmente usou Spring em algum daqueles 50+ projetos, essa é provavelmente a
> correção com maior ROI da revisão inteira.

---

## 3.1 Campo `lastUsed` (pendência de dados)

`lib/technologies.ts` ganhou `lastUsed?: string` — o ano em que a tecnologia foi usada
pela última vez, derivado da timeline: o maior ano de término entre todas as entradas de
`content/timeline-items.ts` que a listam (entrada "current" conta como o ano atual).

> ⚠️ **Esta seção foi escrita quando nada renderizava o campo. Isso mudou.**
> `techYears()` em `components/TechSkillItem.tsx` renderiza hoje, na tela e no PDF:
> `since-lastUsed`, com `lastUsed` do ano corrente virando `now` (`Node.js (2012-2025)`,
> `REST (2012-now)`). O catálogo de `lib/technologies.ts` também está preenchido — os
> "56 vazias" abaixo não valem mais.
>
> ✅ **Efeito colateral resolvido em 19/08.** Os blocos de competência
> (`Project Management`, `Product`) não tinham `lastUsed`, então `techYears`
> devolvia só o `since` e o PDF imprimia `Project Delivery (2013)` ao lado de
> `Node.js (2012-2025)` — um ano solto entre intervalos lê como "fez em 2013 e
> parou". As 41 competências e ferramentas que eram literais em
> `components/ResumePage.tsx` foram migradas para `lib/technologies.ts` como
> `practice` e `deliveryTools`, declaradas pelo mesmo `tech()`, que torna o ano
> de término impossível de esquecer. Fim de 2025 em todas: é quando a Simpli
> fechou, e o 33Labs é papel de IC. Ganho colateral: `Scrum`, `Kanban`,
> `Stakeholder Management`, `Backlog Refinement`, `Jira` e `ClickUp` apareciam em
> dois blocos, e `Figma` já tinha divergido — `other.figma` dizia 2021 e o bloco
> Product dizia 2018. Agora cada um tem um dono só.
>
> `deliveryTools` ficou fora de `other` de propósito: `OtherSection` renderiza
> `Object.values(other)` inteiro, então Jira apareceria no bloco de design/mobile.
>
> **Duas decisões confirmadas pelo Gil em 19/08, não reabrir:** `Linear` é
> `2025-now` (33Labs, é a ferramenta corrente — é a única entrada dos dois
> grupos que não termina em 2025); e a repetição de `(2013-2025)` ao longo do
> bloco de PM **fica como está** — foi avaliada a alternativa de fatorar o ano
> comum para o rótulo (`PROJECT MANAGEMENT (2013-2025): …`) e descartada, o ano
> por entrada vale mais para o ATS do que a limpeza visual custa.
>
> Também confirmado: `Discovery` é `2022-2025` e `Requirements` `2013-2025` — o
> `2010` dos dois era o caso de inflação apontado em §3. O bio da versão Product
> cita discovery sem data de propósito: os "12+ years" da primeira frase se ligam
> a *owning product decisions*, e o discovery de 2022 em diante cabe dentro do
> período da Simpli que a frase descreve.

Das 115 tecnologias (JDBC foi removido), **59 estão preenchidas e 56 vazias**. As vazias
não aparecem em nenhum item da timeline, só nos blocos de skills do `ResumePage.tsx`;
preencher exigiria inventar, então ficaram sem valor.

### Competências transversais são dado, não exibição

Docker, CI/CD, GitHub Actions, Microservices, Distributed Systems e Solution Architecture
foram atribuídas a quase todo projeto pela regra "a partir do `since`, usei sempre que
dava". Isso completou o `lastUsed` das seis, mas o array `technologies` de cada item
também alimenta a linha `Tech:` visível — e o resultado repetia "CI/CD" em metade das
entradas e **estourou o orçamento para 4 páginas no CV web3**.

Resolvido com `crossCutting` em `lib/technologies.ts`: a lista fica no dado, e o
`resolveTechnologies` do `Timeline.tsx` a filtra da lista por projeto. Cada uma segue
declarada uma vez no bloco Skills, com seu ano.

### A Simpli não pode ser fonte de data

Erro corrigido: a Simpli é uma software house, então seu array `technologies` é a **união
dos 31 projetos-filho**. Contá-la datava toda tecnologia herdada com o fim dela própria
(Mai/2025) — jQuery, Backbone, Xamarin e iOS apareciam como usados até 2025.

Note que não é problema de span: a Simpli termina em 2025 e seu filho mais recente
(Enclave, Fev/2025) também. É problema de **agregação**.

Excluindo-a, 23 tecnologias mudaram e **nenhuma ficou órfã**:

| | com Simpli | sem Simpli | nova fonte |
|---|---|---|---|
| Backbone | 2025 | **2013** | simet-nicbr |
| iOS / Xamarin | 2025 | **2015** | ifrete / band-radios-app |
| jQuery | 2025 | **2018** | ativo-coach |
| R | 2025 | **2019** | simplidata |
| Android | 2025 | **2019** | bettie |
| PayPal | 2025 | **2020** | panorist |
| Redis | 2025 | **2022** | jamef |
| Jersey / Flow / Cadence | 2025 | **2023** | wow-talents / letter |
| Java, Kotlin, C#, MySQL, Angular, React Native… | 2025 | **2024** | sharity, clickclock, neon-wallet |

O `33labs` também é pai, mas continua como fonte: é papel de IC direto, o array descreve o
trabalho dele mesmo, e `Docker`, `Microservices` e `REST` não existem em nenhum outro item
naquela data. Excluí-lo demoveria as três injustamente.

> **Regra a lembrar:** mexer em `technologies` de um item da timeline muda o CV visível,
> não só o dado. Foi o que obrigou a remover REST de american-spend, mosaic, jodobix,
> buidlguidl, coz, neo-sharp e neo3-boa — `REST` mantém `lastUsed: 2026` via 33Labs sem
> precisar aparecer na linha `Tech:` de um protocolo de smart contract.

| Grupo | Vazias | Tecnologias |
|---|---|---|
| `ai` | 15 | todas menos `aiTooling` — AI Process Automation, Agent Development, MCP, Claude Skills, Harness Engineering, Spec-Driven Development, Claude, Anthropic API, OpenAI API, Claude Code, Cursor, Context Engineering, Agentic Workflows, Evals, RAG |
| `backend` | 15 | MongoDB, Prisma, REST, WebSockets, Express, TypeGraphQL, Apollo, JDBC, PayPal, ElasticSearch, Docker, CI/CD, GitHub Actions, Microservices, Solution Architecture |
| `blockchain` | 23 | Protocol Architecture, Fuzzing, Gas Optimization, Wagmi, Viem, The Graph, Ethers, Solana, Neo N3, VM Compiler Development, Wallet Development, Wallet Infrastructure, WalletConnect, Multi-chain Integration, SDK Development, Account Abstraction, NFT, Crypto Currency, DEX, AMM, Audit Prep, Slither, Automated Testing |
| `frontend` | 15 | JavaScript, Tailwind, Vue 2, Chakra UI, React Query, Redux Toolkit, ECharts, Valtio, Vite, Jest, Playwright, Storybook, URQL, React Hook Form, Lighthouse |
| `mobile` | 0 | — |

**Duas formas de fechar isso**, quando for útil:

1. **Enriquecer a timeline** — adicionar as tecnologias que faltam nos `technologies` dos
   projetos que de fato as usaram. Corrige a causa (as listas dos projetos são resumidas)
   e o `lastUsed` passa a sair de graça. Também fecha a inconsistência já registrada de
   Redis/Terraform aparecerem em projeto mas não nas skills.
2. **Declarar à mão** as 68, uma a uma.

> **Cuidado se um dia isso for exibido:** `lastUsed` torna explícito o que hoje está
> implícito. Tudo que veio da Simpli fica em 2025 (Java, Kotlin, C#, Python, MySQL,
> Redis, Android, iOS, Xamarin, React Native, jQuery, Backbone, Angular, SvelteKit,
> Electron), e um recrutador passa a ler "não usa desde 2025" em vez de só "usa desde
> 2008". Para vaga enterprise de Java isso pode cortar nos dois sentidos.

## 4. Ordem sugerida de ataque

**Feito**

1. ✅ ~~Separador entre nome e cargo no header impresso~~
2. ✅ ~~Telefone e cidade/país no header~~
3. ✅ ~~Idiomas (`English C2`) visíveis no CV~~
4. ✅ ~~`"60k delivery mans"` e as demais conquistas encurtadas~~
5. ✅ ~~Título e metadata do `enterprise`~~
6. ✅ ~~Prefixar os sub-projetos com o empregador (print-only)~~
7. ✅ ~~Heading `Skills`, headings semânticos e tagged PDF~~
8. ✅ ~~Nomes de arquivo sem `&` nem espaços~~
9. ✅ ~~33Labs em present perfect (funciona durante e depois do vínculo)~~
10. ✅ ~~Ordem cronológica no print, priority só na tela~~
11. 🟡 Sharity/Desabafa e os "19+ years" — resolvidos em parte (ver seção 2)

**Pendente, na ordem que eu atacaria**

12. ✅ ~~Seção de skills de liderança para o `leader`~~ — virou o bloco `Project
    Management` da versão Technical Project Manager (ver §3)
13. ❌ **Spring** — **fechado, não pendente.** Gil confirmou em 19/08 que nunca usou
    Spring. Não é questão de registrar, é de aprender: foi para `content/career-gaps.md`
    §2.1. O que ele *usou* e ainda não está no CV — Hibernate/JPA, Kafka/RabbitMQ,
    Kubernetes, JUnit/Mockito, gRPC — está listado lá em §1, junto com o bloqueio (falta
    recuperar projeto e ano no histórico). **Trilha enterprise adiada por decisão
    explícita**
14. ✅ **Os 3 anos, fechados nas 6 versões.** A entrada `early-career` (FingerPrint,
    Escala, NetStartup, 2007-2010) só imprimia na enterprise; agora imprime em todas, e
    a experiência começa em 2007 em vez de 2010 — a conta bate com os "19+ years". Para
    caber, ganhou `printDescriptionIn`: o detalhe de PHP/Java júnior imprime nos CVs de
    engenharia e some no de PM e PO, onde só as datas trabalham.
    🟡 **Sharity/Desabafa em enterprise e web3** seguem sem entrada própria, mas a nota
    nova (item 19) responde a pergunta que o leitor faria
15. ❌ **Achievements em coluna única — desnecessário, premissa não se confirma.** Testado
    com `pdftotext` sem `-layout` nos 6 PDFs: cada conquista sai em linha própria, com o
    projeto e as métricas dele juntos. O grid não cola "Neon Wallet" em "Multilaser
    Runin". A ordem de leitura é por coluna em vez de por linha, o que é inofensivo —
    são bullets independentes, sem semântica de par
16. ✅ **Metadata gravado.** `scripts/print-cv.mjs` carimba `Title`, `Author`, `Subject`,
    `Keywords` e `Creator` com `pdf-lib` depois do render do Chrome, com keywords por
    versão (o vocabulário que a própria página já sustenta, nunca termos que o CV não
    tem). `Tagged: yes` sobrevive ao re-save, verificado. A contagem de páginas passou a
    sair do `getPageCount()` do pdf-lib em vez do regex no `/Count`
17. ✅ ~~`lastUsed` nos blocos de competência~~ — migrados para `practice` e
    `deliveryTools` em `lib/technologies.ts`. Ver §3.1
18. ✅ ~~`/leader` e `/project-manager` servem a mesma página~~ — `/leader` foi removida
    por decisão do Gil (19/08). A página real vive em `app/project-manager/page.tsx`
19. ✅ **Nota de seleção no fim da experiência** (print-only): "Selected projects — the
    full history is at gil.solutions". Um CV de 3 páginas não cabe 50+ projetos, e os
    Achievements citam alguns que não entraram na versão; a nota transforma um buraco
    que o leitor notaria num ponteiro, e dá a URL ao parser
20. ⬜ **A linha `Tech:` agregada da Simpli** saiu do PM e do PO (é a união de 31
    projetos-filhos, que listam a própria stack logo abaixo). Continua em general, web3,
    enterprise e webdev — vale reavaliar se ela ajuda mesmo nessas quatro

---

## Apêndice — mudanças já aplicadas nesta revisão

### Header impresso (`components/Header.tsx`, `components/StickyHeader.tsx`)
Linha 1 passou a ser `Nome · Cargo · Localização`; linha 2 ganhou o telefone no fim.

- Separador `·` entre os campos, resolvendo a extração da primeira linha.
- Nome e cargo em `text-2xl` (nome bold, cargo regular), localização em `text-sm`.
- Telefone como último item da linha de contatos, com link `tel:`.
- **Alinhamento à esquerda:** o header carregava `pl-5` (wrapper `.sticky-expanded`) e
  `pl-1.5` (linha de contatos) que não eram zerados no print, enquanto o corpo usa
  `print:p-0` — daí o desalinhamento com a bio. Adicionados `print:pl-0` / `print:pr-0`
  no wrapper e `print:pl-0` + `print:justify-start` na linha de contatos. Nome, contatos
  e bio agora todos em `left: 0`.
- **`whitespace-nowrap` na linha 1 é load-bearing.** Com a localização somada, o título
  mais longo (`Tech Lead / Engineering Manager`) enchia os 740px e quebrava — deixando só
  `Gil` na primeira linha, que é justamente o que o parser lê como nome. Com `nowrap` +
  localização em `text-sm`, o `/leader` usa 717 de 740px (23px de folga).

> **Restrição a respeitar:** a versão mais longa está a ~97% da largura da linha. Título
> novo ou localização mais longa estoura. Se precisar, o espaço sai de reduzir a
> localização ou o `gap-2.5`.

### Altura do header (`components/Header.tsx`)
O header reservava **128px para 66px de conteúdo** — 62px mortos no topo de toda
página 1. Trocado `print:min-h-[88px]` por `print:min-h-0` (altura natural).

> **Correção de diagnóstico:** minha primeira leitura atribuiu isso a um conflito de
> cascata entre `print:min-h-[88px]` e o `min-h-[128px]` do ternário `compact`. **Estava
> errado.** Conferindo o CSS gerado: `.min-h-[128px]` fica no offset 21812 (topo) e a
> regra de print no offset 37178, dentro de `@media print` — ou seja, a regra de print
> vem depois e vencia por ordem de cascata normalmente. Não havia conflito, e o
> `!important` que cheguei a aplicar era desnecessário (removido).
>
> A causa real era **só a transição** (ver abaixo). O que me enganou foi medir
> `getComputedStyle` logo após trocar a media: o valor lido era o frame inicial da
> animação de 300ms, não o valor final. Medindo após 600ms, dá 0px como esperado.

**Resultado medido:** as quebras de página não mudaram (mesma contagem de palavras na
página 1 nas 5 versões) — o próximo bloco é uma entrada inteira da timeline e não cabe em
62px. O ganho é **headroom guardado**: espaço para adicionar a linha de idiomas ou o
bloco de liderança sem empurrar página.

### Bloco de skills (`components/SkillSection.tsx`, `components/ResumePage.tsx`)
Só no print — a tela segue com heading, ícone e pills por categoria.

- Heading `Skills` (print-only, `text-[14pt] font-semibold`), igualando o estilo de
  "Notable Achievements" e "Work Experience". Começou como "Technical Skills" e foi
  encurtado para comportar a linha de idiomas sem soar estranho — "Skills" também é o
  header de seção mais canônico para ATS, então a troca não custa nada de matching.
- `LANGUAGES: English (C2), Portuguese (Native)` como última linha, reaproveitando o
  formato `Nome (valor)` das tecnologias (o campo `since` carrega a proficiência).
- Categorias deixaram de ser heading e viraram rótulo inline na linha das tecnologias:
  `BACKEND: Node.js (2012), Java (2008), ...`
- Formatação do rótulo: `uppercase font-semibold tracking-wide text-[0.72rem]`. Caixa
  alta + tracking é o que muda o registro sem precisar de um tamanho distante do da
  lista.

**Ganho de espaço na página 1** (vs. estado anterior): +9 palavras em general, web3,
enterprise e product; **+65 no leader** (entrou uma entrada inteira da timeline).

> **Artefato conhecido, cosmético:** com o rótulo em `0.72rem` e as techs em `0.8rem`, o
> `pdftotext` insere uma linha em branco após a primeira linha de cada categoria — os
> tamanhos diferentes viram blocos separados. Verificado em teste isolado: com o rótulo
> em `0.8rem` a quebra some. O rótulo continua colado às suas tecnologias na mesma linha
> nos dois casos, então keyword matching não é afetado. Toggle de uma classe se incomodar.

### Espaçamento das seções (print)
Padronizado em **20px acima de todo título de seção, 10px abaixo**, medido no DOM em
media print. Antes:

| Título | Acima | Abaixo |
|---|---|---|
| Notable Achievements | 12px | 4px |
| Technical Skills | 12px | 10px |
| Work Experience | 32px | 20px |
| Academic Qualifications | 20px | 20px |

Arquivos tocados: `Achievements.tsx` (`print:mt-3`→`print:mt-5`, `print:mt-1`→`print:mt-2.5`),
`ResumePage.tsx` (`print:mt-3`→`print:mt-5`), `Timeline.tsx` (heading
`print:mt-8`→`print:mt-5`, lista `print:mt-5`→`print:mt-2.5`, e o mesmo na lista de
Academic Qualifications).

**Efeito no espaço:** neutro — o que foi economizado acima de Work Experience foi gasto
abaixo de Notable Achievements. As contagens de palavras da página 1 não mudaram em
relação ao build anterior. O ganho aqui é consistência, não espaço.

> **Cuidado com espaçador aninhado:** o gap abaixo de "Technical Skills" é a soma de dois
> — `print:gap-y-1.5` (6px) no container e `print:mt-1` (4px) no texto interno do
> `SkillSection`. Medir a caixa do wrapper dá 6px e engana; o texto começa nos 10px. O
> mesmo `mt-1` também separa as categorias entre si, então mexer nele mexe nos dois
> lugares.

### Skills alinhadas com os projetos

Onze tecnologias que apareciam nos projetos (ou só na prosa) entraram nos blocos de skills:
Redis, ECS, S3, SNS, SQS, Terraform, Microservices, Distributed Systems, Solution
Architecture, CI/CD e GitHub Actions. As cinco últimas existiam **só no bloco do
enterprise** — o CV "principal" era o que perdia o vocabulário de arquitetura.

Coube nas 5 versões sem estourar página; a mais apertada (`web3` e `leader`) ficou com
19pt livres.

`Terraform` não existia em `lib/technologies.ts` — só na prosa da Simpli ("a reusable
Terraform starter kit"). Foi criado, marcado como `crossCutting` (é prática de infra, não
diferencia projeto: verificado, 0 ocorrências nas linhas `Tech:`) e ancorado nos 11
projetos com infra AWS a partir de 2019, o que deriva `lastUsed: 2025` via Enclave.

> ⚠️ **Confirmar:** `since: "2019"` para o Terraform é uma estimativa minha, não um dado
> vindo do repo. A prosa da Simpli descreve o starter kit sem datar quando foi adotado.
> Se o ano certo for outro, é uma linha em `lib/technologies.ts`.

### Ordenação: tela e papel ordenam diferente

`priority` é ferramenta de **posicionamento**: o CV enterprise rebaixa Enclave Wallet e COZ
de propósito, porque são o trabalho Web3. Isso funciona numa página que o leitor rola, mas
no papel colocava um projeto de 2024 abaixo de um de 2014 — e currículo fora da ordem
cronológica reversa lê como desleixo, além de confundir o cálculo de datas do ATS.

A partir daí as duas mídias ordenam diferente: **tela por `priority`, print por data**
(`byDate`). O aninhamento pai→filhos é preservado nos dois.

Só `enterprise` e `product` estavam afetados (3 itens); `general`, `leader` e `web3` já
saíam cronológicos.

**Por que duas árvores de render, e não CSS:** `order` do flexbox só reordena entre irmãos
do mesmo container, e os itens vivem em 3-4 níveis de aninhamento (bloco de run → lista →
colapsável → lista). Não há como reordenar o conjunto por CSS.

**Custo de manutenção: ~18 linhas.** A árvore de print não usa nada da máquina da tela —
sem cutoff de "Show more", sem botão, sem runs, sem barra. E as duas passam pelo mesmo
`renderItem`, então as props não podem divergir.

> **Duas armadilhas tratadas na implementação:**
> - **Órfãos:** um filho pode imprimir sem que o pai imprima (`printIn` é por item).
>   Iterar só por `printTopLevel` sumiria com ele; há um `printOrphans` para isso. Hoje
>   não existe nenhum, mas o próximo `printIn` editado pode criar.
> - **Filtro:** `shouldPrint` pressupõe que já rodou sobre itens com `priority !== 4`. A
>   árvore de print parte de `timelineItems` cru, então aplica as duas condições juntas —
>   sem isso, um item `priority: 4` com `printIn` omitido vazaria para o PDF.

### Metadata, headings semânticos e nomes de arquivo

**Enterprise com o cargo errado.** Dois pontos independentes escreviam "Principal Software
Engineer" no CV de backend: `metadata.title` em `app/enterprise/page.tsx` (que o Chrome
copia para o `Title` do PDF) e o ternário de `title` em `ResumePage.tsx`, sem branch para
`enterprise`.

**Headings semânticos.** `h1` no nome, `h2` em Notable Achievements / Skills / Work
Experience / Education, `h3` nas categorias de skill e nos títulos de projeto. Feito
**antes** de ligar o tagged PDF de propósito: `tagged: true` num documento só de `div`
emite uma árvore de parágrafos e não serve para nada.

Dois problemas apareceram nesse caminho:

- **A tela não tinha `h1` algum.** O único vivia dentro de um bloco `hidden print:flex`,
  ou seja `display:none` no navegador — o oposto do que o item pedia para os screeners
  LLM que leem o site. O wordmark "Gil ✦ Solutions" virou `h1`.
- **`h1` duplicado.** O `StickyHeader` monta o `Header` duas vezes (camadas expandida e
  compacta do crossfade). Só a expandida usa `h1` agora; a compacta cai para `div`.

O HTML tem duas tags `h1`, mas são mutuamente exclusivas por media — verificado
renderizando: tela devolve `["Gil Solutions"]`, print devolve `["Gil Lopes Bueno"]`.
Exatamente uma na árvore de acessibilidade em cada contexto.

**Tagged PDF.** `tagged: true` no `page.pdf()` (playwright-core 1.61). `Tagged: yes` nos 5.

**Nomes de arquivo.** `Gil-Lopes-Bueno-<Cargo>.pdf`, sem `&` nem espaços, atualizados nos
dois pontos que os referenciam (`scripts/print-cv.mjs` e o `pdfFileName` do
`ResumePage.tsx`).

> ⚠️ Os arquivos com o nome antigo foram removidos. Qualquer link direto já compartilhado
> para `/documents/Gil Lopes Bueno - ....pdf` passa a dar 404. Manter cópias com o nome
> antigo resolveria, mas devolve o problema do `&` para quem usa o link velho.

### Transições no print (`app/globals.css`)
Um PDF é um snapshot único, então transição em voo é congelada nele. O
`transition-[min-height]` do header fazia exatamente isso: mudar para media print inicia
uma animação de 300ms até a min-height de impressão, e o export roda antes — o PDF ficava
com a altura de tela. Adicionado `transition: none !important` dentro do `@media print`.

**Animações foram deixadas de fora de propósito:** `animate-fade-up` vai de `opacity 0 → 1`
com `forwards`, e os elementos carregam `opacity-0`. Cancelar a animação congelaria o
conteúdo invisível no PDF.

**Validação:** os 5 PDFs foram regerados, todos em 3 páginas, e a primeira linha extrai
delimitada em todas as versões.
