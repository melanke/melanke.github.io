# Gaps de carreira — o que ainda não está no CV

> **Companheiro negativo do portfólio.** `content/timeline-items.ts` e
> `components/ResumePage.tsx` dizem o que o Gil **fez**. Este arquivo diz o que
> ele **não fez, fez e enferrujou, ou fez e ainda não registrou** — separados,
> porque as três coisas pedem ações diferentes.
>
> Nasceu da revisão em `CV_REVIEW.md`, que levantou os buracos por tipo de vaga
> mas não tinha onde guardá-los.

## Para que serve

1. **Fila de estudo.** O que aprender primeiro para destravar cada trilha de vaga.
2. **Fonte para skills e agentes.** `gilsay`, `comment-writer`, `content-pipeline`
   e qualquer skill que escreva sobre o Gil leem
   `.claude/skills/_shared/professional-background.md` para saber o que ele tem.
   Este arquivo é o complemento: **nada listado como ❌ ou 🟡 pode ser afirmado
   como experiência atual** em bio, resposta de formulário de vaga, comentário ou
   artigo. Um 🟡 pode ser mencionado no passado, com a data — nunca no presente.
3. **Registro de decisão.** Por que um gap segue aberto (custo, prioridade,
   NDA) em vez de reabrir a mesma discussão a cada rodada.

## Legenda

| | Significado | Ação |
|---|---|---|
| ⬜ | **Tenho, não está no CV.** Experiência real, atual, só não registrada | Adicionar ao CV — não é estudo |
| 🟡 | **Tive, enferrujou.** Usei em produção, faz anos; preciso revisar antes de defender em entrevista | Revisar + adicionar com a data honesta |
| ❌ | **Nunca usei.** Não pode aparecer no CV até existir uso real | Estudar e construir algo |
| 🔒 | **Tenho, mas não posso provar.** NDA / código de cliente | Construir um equivalente público |

---

## 1. Não é gap — é falta de registro (⬜ e 🟡)

Isto é a maior fatia de valor imediato: sai no CV **sem precisar estudar nada**,
ou com uma revisão curta.

| Item | Status | Onde usou | Observação |
|---|---|---|---|
| Hibernate / JPA | 🟡 | Era Simpli/Java | Confirmado pelo Gil (ago/2026). Precisa puxar o projeto e a data exata do histórico |
| Kafka / RabbitMQ | 🟡 | Era Simpli | Idem — qual projeto, qual dos dois, que ano |
| Kubernetes | 🟡 | Era Simpli | O CV hoje só tem ECS. Idem sobre projeto e data |
| JUnit / Mockito | 🟡 | Era Java | Confirmado. Enferrujado junto com o resto da stack JVM |
| gRPC | ⬜ | A confirmar | Confirmado como uso real; falta amarrar a um projeto da timeline |

> **Bloqueio conhecido:** todos os cinco vêm da era Java/Simpli e o Gil precisa
> abrir o histórico para recuperar projeto e ano. Enquanto isso não acontece,
> não entram — a regra do portfólio é que toda skill tem `since` e `lastUsed`
> derivados de um item real da timeline. **Decisão de ago/2026: a trilha
> enterprise fica por último**, então esse levantamento não é urgente.

**Quando forem adicionados:** entram em `lib/technologies.ts` com o ano real de
último uso, e no array `technologies` do item da timeline correspondente. O
`lastUsed` vai renderizar `(2016-2020)` e não `(desde 2016)` — o que é honesto e
é justamente o ponto. Ver o aviso em `CV_REVIEW.md` §3.1 sobre o `lastUsed`
cortar nos dois sentidos numa vaga de Java.

---

## 2. Gaps por trilha de vaga

### 2.1 Enterprise / Java — o maior gap (trilha adiada)

Diagnóstico completo em `CV_REVIEW.md` §3 "Dev enterprise". Resumo: o bio promete
Java/Kotlin/distribuídos/50M+ invoices e o bloco de skills entrega `Jersey (2020)`
e `C# (2018)` — lê como stack datado.

| Item | Status | Peso na vaga |
|---|---|---|
| **Spring / Spring Boot** | ❌ | **Keyword nº 1 de vaga Java enterprise.** 0 ocorrências nos PDFs. É o item de maior ROI da revisão inteira — e está fechado, porque nunca foi usado |
| Testcontainers | ❌ | Padrão atual de teste de integração na JVM |
| Observabilidade (Datadog / Grafana / OpenTelemetry) | ❌ | Zerado nos PDFs. Cobrado em qualquer vaga sênior de backend, não só JVM |
| Compliance (SOC2 / GDPR / LGPD / ISO) | ❌ | Filtro em vaga enterprise/fintech |

> **Realidade da trilha:** sem Spring e com a stack JVM enferrujada, essa é a
> trilha mais cara de destravar. Adiada por decisão explícita (ago/2026). Se um
> dia virar prioridade, a ordem é: Spring Boot → Testcontainers → OpenTelemetry.

### 2.2 Product Owner

O bloco Product é bem construído e o bio é o melhor escrito dos seis. O que falta
é **credibilidade de outcome**, não vocabulário.

| Item | Status | Por quê |
|---|---|---|
| Métricas de produto (retenção, ativação, conversão) | ❌ | As métricas do CV — GMV, volume, invoices — são de **escala**, não de produto. PO é cobrado em outcome |
| A/B testing / experimentação | ❌ | Vocabulário padrão de PO de produto digital |
| NPS / pesquisa com usuário quantitativa | ❌ | — |
| Analytics (Amplitude, Mixpanel, GA) | ❌ | Zero ferramenta de analytics no CV inteiro |
| Certificação PSPO | ❌ | Não é hard filter tão forte quanto PMP para PM, mas ajuda |

> **Nuance:** o Gil fez discovery, requisitos e priorização de verdade, por 12
> anos — isso é real e está no CV. O gap é que ele fez **product delivery**, não
> **product growth**. Duas vagas diferentes com o mesmo título. O CV atual serve
> bem a primeira; a segunda exige aprender o instrumental acima.

### 2.3 Technical Project Manager

Trilha **ativa** (`/project-manager`). O vocabulário foi resolvido em ago/2026 —
o bloco Project Management cobre Scrum, Kanban, Sprint Planning, Estimation &
Proposals, Scheduling, Budget, Risk, Stakeholder e as ferramentas
(Jira/YouTrack/ZenHub/ClickUp/Linear). O que resta:

| Item | Status | Por quê |
|---|---|---|
| **Certificação (PMP, CSM, PSM I, PSPO, SAFe)** | ❌ | **Hard filter em boa parte das vagas de PM.** `Certif` = 0 ocorrências nos PDFs. **Maior ROI desta trilha** — PSM I (Scrum.org) é o caminho mais curto: ~US$200, sem curso obrigatório, e o Gil já pratica Scrum desde 2013 |
| Gantt / caminho crítico / MS Project | ❌ | Vaga de PM tradicional (não-ágil) pede explicitamente |
| Gestão de fornecedor / terceiros | ❌ | Ele geria **entrega para** cliente, não **contrato com** fornecedor. São coisas diferentes e a vaga sabe |
| Orçamento gerido (total, ticket médio, faixa) | 🟡 | Ele estimava para proposta comercial, aprovava gastos e acompanhava custos — **nenhum valor está no CV**. Fonte provável: arquivo de propostas ou notas fiscais da Simpli |
| Throughput / lead time de sprint | 🟡 | Existiu em Jira/YouTrack/ZenHub/ClickUp; as contas antigas provavelmente estão encerradas. Só vale o esforço se o ClickUp ainda estiver ativo |

> **Em grande parte fechado em 19/08.** Três métricas de entrega entraram:
>
> - **Simultaneidade** — "3 projetos de cliente ao mesmo tempo, até 7" no bio do
>   TPM. Corroborado pelo próprio registro: média 3,1 e pico 7 em papéis de
>   gestão, calculado sobre os 31 projetos-filhos documentados (de 50+
>   entregues, então é piso).
> - **Precisão de estimativa** — na entrada do ClickClock, versão `leader`:
>   estimativa em dois níveis (alto nível para o cliente, por tarefa pelos
>   próprios devs), meta de **não passar 2h do estimado**, muito ultrapassada no
>   início e rara ao fim, conforme o dado voltava aos devs como feedback. É a
>   resposta para a pergunta nº 1 de entrevista de PM.
> - **Retenção** — duração média de engajamento de 20,6 meses (mediana 16), 8 de
>   31 projetos acima de 2,5 anos. **Ainda não está dito no CV** (ver abaixo).
>
> **O que continua faltando:** orçamento (linha nova acima), throughput, e a
> retenção — inclusive o cluster Neo/COZ, que são 6+ projetos para uma mesma
> relação de cliente ao longo de 6 anos, terminando com convite para o board.
> Está inteiro no registro, nunca foi contado como uma coisa só.

### 2.4 Web dev moderno

Trilha `/webdev`. O CV cobre React/Next/TypeScript/Node com profundidade, mas
nenhum projeto da timeline documenta as features modernas do framework:

| Item | Status | Por quê |
|---|---|---|
| React 18/19 (Suspense, transitions), RSC | ❌ | Não documentado em nenhum item |
| App Router / Server Actions | ❌ | **Ver nota abaixo** |
| Acessibilidade (WCAG, ARIA, testes) | ❌ | Cobrado em vaga de front sênior |
| Core Web Vitals / Lighthouse como prática | ❌ | O Gil tem uma vitória de performance real (Jamef: 8s → poucos ms) mas ela não está enquadrada em vocabulário de Web Vitals |

> **Nota sobre App Router:** este site é Next.js 15 com App Router. Isso é uso
> real, então tecnicamente não é ❌ — só não está registrado como projeto na
> timeline. Se o portfólio virar um item da timeline, App Router e RSC saem de
> graça. É a correção mais barata desta trilha inteira.

### 2.5 Web3 / protocol

A trilha mais forte do CV. Um gap só, mas estrutural:

| Item | Status | Por quê |
|---|---|---|
| Prova pública de código Solidity | 🔒 | O único GitHub linkado é o BSLib, que é TypeScript. Nenhum contrato verificado, relatório de auditoria ou repo. Todo o trabalho de Solidity é de cliente/NDA |

> **Único caminho:** construir algo público. Um contrato pequeno mas real,
> verificado no Etherscan, com testes em Foundry e README — vale mais que
> qualquer keyword nova. É o item de maior ROI do portfólio inteiro, porque a
> trilha web3 já está a um passo de fechar.

### 2.6 Liderança / Engineering Manager

**Trilha descartada como frente de candidatura (ago/2026).** Registrado aqui
porque a experiência é real e a decisão pode ser revista.

| Item | Status | Por quê |
|---|---|---|
| Métricas de gestão de pessoas | 🟡 | Única métrica no CV: "30 devs, 5 team leads". Sem contratação, retenção, ciclo de performance, headcount, orçamento de time |
| Vocabulário de EM no bloco de skills | ⬜ | Hiring, Team Building, Delegation, Technical Roadmap e Engineering Standards existiram num bloco `Leadership` que foi fundido no `Project Management` em ago/2026. **A experiência é real** — está preservada no histórico do git, e volta em minutos se a trilha reabrir |

---

## 3. Gaps transversais

| Item | Status | Onde dói |
|---|---|---|
| 3 anos faltando no papel | 🟡 | O CV diz "19+ years" mas a timeline impressa cobre 16 em 5 das 6 versões — a entrada `FingerPrint, Escala, NetStartup (2007-2010)` só cabe no `enterprise`. Não é gap de experiência, é gap de orçamento de página (`CV_REVIEW.md` §2) |
| Nenhuma certificação, de nenhum tipo | ❌ | PM (ver 2.3), cloud (AWS SA), Scrum. Escolha legítima, mas é filtro automático em parte das vagas |
| Sharity e Desabafa citados nos Achievements sem entrada que os sustente em `enterprise` e `web3` | 🟡 | Idem: orçamento de página, não falta de experiência |

---

## 4. Fila de estudo sugerida

Ordenada por **custo de destravar ÷ valor na candidatura**, não por interesse:

1. **Contrato Solidity público, verificado, com testes em Foundry** — fecha o
   único gap da trilha mais forte. Semanas, não meses.
2. **PSM I** — ~US$200, sem pré-requisito de curso, e o Gil já pratica desde
   2013. Destrava o filtro de certificação da trilha TPM ativa.
3. **Registrar o portfólio como item da timeline** — App Router, RSC e Server
   Actions saem de graça. Horas, não semanas. Não é estudo, é registro.
4. **Recuperar uma métrica de delivery da Simpli** — não é estudo. É o dado que
   falta no CV de TPM.
5. **Observabilidade (OpenTelemetry + Grafana)** — o gap mais transversal: pesa
   em enterprise, backend sênior e até em web3.
6. **Analytics de produto (Amplitude ou GA4) + um A/B test real** — só se a
   trilha Product virar prioridade.
7. **Spring Boot** — maior ROI *dentro* da trilha enterprise, mas a trilha está
   adiada, então fica por último.

---

## 5. Histórico de decisões

| Data | Decisão |
|---|---|
| ago/2026 | Trilha **enterprise adiada**. Gil usou Hibernate/JPA, Kafka/RabbitMQ e Kubernetes em produção, mas há anos; precisa puxar detalhes do histórico e reestudar antes de defender em entrevista |
| ago/2026 | **Spring nunca foi usado.** O item de maior ROI apontado pelo `CV_REVIEW.md` está fechado — não é questão de registrar, é questão de aprender |
| ago/2026 | **Engineering Manager descartado** como frente de candidatura. A versão `leader` foi reaproveitada como Technical Project Manager em vez de criar uma sétima versão |
| ago/2026 | **Bloco `Leadership` fundido no `Project Management`** em vez de virar seção própria: um heading custa ~5 linhas do orçamento de 3 páginas, quatro pills custam 1 |
| ago/2026 | **"8+ years in Web3" mantido.** É verdade contando wallet/SDK; separar "anos em Web3" de "anos em protocolo Solidity" foi avaliado e descartado |
| ago/2026 | **Sem link público de Solidity.** Avaliado; não existe código disponível para linkar (cliente/NDA). Só se resolve construindo algo novo |

---

## Manutenção

Quando um item sair daqui para o CV, **apague a linha** e registre em §5 se a
decisão foi relevante. Um gap resolvido que continua listado faz os agentes
subestimarem o Gil — que é exatamente o erro oposto ao que este arquivo existe
para evitar.
