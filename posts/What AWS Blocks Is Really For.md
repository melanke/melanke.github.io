---
published-at: '2026-06-25T12:00:00.000+00:00'
summary: >-
  AWS Blocks is a new open-source TypeScript framework that turns your backend
  code into the AWS infrastructure that runs it, an approach called
  Infrastructure-from-Code. This piece covers what Blocks actually does, how it
  compares to earlier IFC tools like Encore.ts and Nitric, the lock-in and
  single-Lambda trade-offs worth watching, and why AWS's backing might finally
  push Infrastructure-from-Code into the mainstream.
og-image: /blog-images/what-aws-blocks-is-really-for.png
linkedin-url: ''
linkedin-post: |-
  🤔 AWS just shipped Blocks, and the pitch leads with something odd: it assumes an AI agent is the one writing your backend.

  The framework turns your TypeScript into the AWS infrastructure that runs it. One line becomes a DynamoDB table and a Lambda. Run it locally with no AWS account, deploy with no code changes.

  I'm suspicious and optimistic at the same time. I think AWS has two goals it won't put on the announcement slide, and there's one real trade-off the "no ceiling on what you can build" pitch quietly skips.

  If you build backends or care about where infrastructure-from-code is heading, I wrote up what I'd watch before adopting it. 👇

  hashtag#AWS hashtag#SoftwareEngineering hashtag#DevOps hashtag#InfrastructureAsCode hashtag#TypeScript hashtag#CloudComputing hashtag#Serverless hashtag#AI
twitter-post: |-
  AWS Blocks just shipped, and the headline isn't "faster" or "less boilerplate."

  It's that an AI agent should write your backend, and the framework exists to keep it on the rails.

  I'm suspicious and sold at the same time. Why both: 🧵
  ---
  What it is: Infrastructure-from-Code. Your TypeScript *is* the infra.

  new KVStore(app, "todos") is an in-memory store locally, and a DynamoDB table on deploy. Same line, no changes.

  npm run dev gives you a working app, no AWS account needed.
  ---
  The first goal AWS won't put on the slide: onboarding. A few lines and you have a Postgres DB and auth running locally.

  The second: gravity. When your app code is your infra, leaving the ecosystem stops being a migration and becomes a rewrite.
  ---
  The catch nobody markets: every API method runs inside one Lambda today. One memory ceiling, one timeout.

  Fine for a prototype or small/medium API, not microservices. AWS sells "no ceiling on what you can build." There's a ceiling, and it's that Lambda.
  ---
  Why I'm optimistic anyway: the abstraction has escape hatches. Drop to raw CDK, adopt existing resources, or eject a Block entirely. The simple path is a default, not a cage.

  And tying your app code to your infra is how you stop the two from rotting out of sync.
  ---
  So the real question for backend folks: does infra-from-code finally make every product dev own the deploy, or does AWS-shaped lock-in scare you off?

  And how much abstraction over your infrastructure is too much, before it leaks on you?
  ---
  Full write-up, suspicious but optimistic, with the escape hatches and the Lambda-lith caveat:
  https://gil.solutions/blog/what-aws-blocks-is-really-for

  #AWS #DevOps #InfrastructureAsCode
twitter-image-prompt: "16:9 aspect ratio. Dark near-black deep-navy background. On the left, a single clean line of TypeScript code rendered in crisp monospace with electric-blue and purple syntax highlighting: new KVStore(app, 'todos'). From that line, thin glowing roots/branches grow rightward and expand into a tight constellation of abstract AWS service nodes (a database cylinder, a function block, an auth shield) connected by an emerald-and-blue web that looks deliberately hard to untangle. Minimal vector style, technical and precise, no stock-photo people, no logos. Short bold text overlay, upper area, ≤6 words: 'One line. The whole cloud.' On-brand palette: deep navy base, electric blue + purple + emerald accents."
reddit-posts:
  - subreddit: r/aws
    flair: discussion
    title: >-
      AWS Blocks is convenient until you hit the single-Lambda limit
    body: |-
      I ran a software house for eleven years where AWS was part of daily work across a lot of small-to-medium products, so I've been poking at the Blocks preview with both interest and suspicion.

      The Infrastructure-from-Code idea is genuinely nice to work with. `new KVStore(app, "todos")` is an in-memory store locally and a DynamoDB table on deploy, the table definition and the code that reads it can't drift apart, and `npm run dev` gives you a working backend with no AWS account. For prototypes and small/medium APIs that's a real ergonomic win.

      What I keep circling back to:

      - Every API method runs inside one Lambda today (single memory ceiling, single timeout). It's a Lambda-lith, not microservices, so per-method scaling and isolation aren't there yet.
      - The abstraction has teeth: deleting a line reaches into live infrastructure, and whether the data survives depends on the removal policy it sets (CDK defaults to retaining stateful resources, but in a preview I'd verify before trusting it). There are escape hatches (raw CDK in `index.cdk.ts`, `fromExisting`, vendorize), which I appreciate, but the gravity is all AWS-shaped.

      I wrote up my full take, suspicious but optimistic, here: https://gil.solutions/blog/what-aws-blocks-is-really-for

      It's still preview, so the single-Lambda thing may well be temporary. For those of you running real workloads: would you put Blocks in front of anything production today, or is the single-Lambda model plus the lock-in a dealbreaker until it matures?
    notes: >-
      Lead with the skeptical/trade-off angle — r/aws distrusts anything that echoes the AWS
      announcement. Post mid-week, US morning. Reply to every comment in the first 2–3 hours;
      be ready to defend the Lambda-lith claim with the preview docs. Blog is secondary — the
      in-thread discussion is the real post. Do not cross-post simultaneously to r/devops.
twitter-engagement-queries:
  - query: ("AWS Blocks" OR "infrastructure from code" OR "infra from code") (lock-in OR abstraction OR skeptical OR worried) min_faves:15 -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en within_time:30d
    targets: devs reacting to AWS Blocks / Infrastructure-from-Code with doubt or curiosity
    why: directly on this article's subject — AWS Blocks and the IFC trade-off
    angle: share the leaky-lock-in nuance (open-source, runs locally, CDK underneath) and the single-Lambda caveat; mention I wrote a suspicious-but-optimistic take
  - query: ("AWS Blocks") (tried OR preview OR shipped OR deploy) min_faves:10 -filter:replies -is:quote -filter:mentions -min_replies:10 -has:cashtags lang:en within_time:30d
    targets: early adopters posting first impressions of the Blocks preview
    why: same subject; people testing it are primed to discuss the per-method scaling limit
    angle: ask whether they hit the single-Lambda ceiling yet; offer the Lambda-lith framing from the article
  - query: ("vendor lock-in" OR "aws lock-in" OR "cloud lock-in") (avoid OR escape OR trapped OR "worth it") min_faves:20 -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en within_time:30d
    targets: devs debating whether cloud lock-in is worth the convenience
    why: the article's "leaky lock-in" framing of IFC
    angle: distinguish leaky lock-in (portable-ish code) from an AWS-shaped mental model — that's the part you can't easily migrate
  - query: (AI OR agent OR LLM) ("infrastructure as code" OR terraform OR backend) (generated OR wrote OR vibe) min_faves:15 -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en within_time:30d
    targets: people posting about agents generating infra or backend code
    why: overlaps "Discovery and Spec" — constrain the agent before line 1; Blocks does it with steering files
    angle: the Mosaic parallel — give the agent a safe, pre-audited vocabulary so a non-expert ships something sound; link the Discovery-and-Spec harness idea
  - query: ("leaky abstraction" OR "too much magic" OR "over-abstracted") (framework OR backend OR infra OR cloud) min_faves:15 -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en within_time:30d
    targets: devs venting about frameworks that hide too much
    why: overlaps "When Dependency Injection Goes Too Far" — abstraction as a tool, not a virtue
    angle: Blocks' escape hatches (raw CDK, fromExisting, vendorize) are the right shape for an abstraction; the DI-too-far lesson is knowing when it stops paying off
og-image-prompt: "16:9 aspect ratio. Dark near-black, deep-navy background, minimal technical vector style. Center composition: a glowing block of abstract application code (clean horizontal bars in electric blue and purple) on top, fusing downward into a denser infrastructure substrate below (abstract server/database/function nodes in emerald and steel) — the seam where the two layers meet is dissolving, so code and infrastructure become one continuous material. On the right edge, a subtle one-way doorway or turnstile motif rendered in faint emerald, hinting at lock-in (easy to enter, hard to exit). No text, no logos, no stock-photo people. Serious, precise, slightly abstract. Palette: deep navy base with electric blue, purple, and emerald accents."
---
AWS says it built Blocks for AI agents. I think it had two other goals in mind.

Blocks went into public preview in June 2026, and the official pitch is interesting precisely for what it leads with. It doesn't open with "ship faster" or "less boilerplate." It opens by assuming an AI agent is the one writing your backend, and positions itself as the framework that keeps that agent on the rails. That's a real goal, and I'll come back to it.

But I read two other goals into the launch, and AWS won't put either on the announcement slide. The first is lowering the barrier to entry so that more developers can stand up production infrastructure without a cloud specialist holding their hand. The second is gravity. Once your application code *is* your infrastructure, leaving the ecosystem stops being a migration and starts being a rewrite.

There's a why-now underneath both goals, and I'd bet it's competitive. For years AWS owned the primitives and let the developer experience slip to a layer of platforms sitting on top of it. Vercel is the obvious one, with SST and Encore Cloud playing the same game. They give developers the deploy-in-one-command experience AWS never quite managed, and a lot of them run on AWS underneath while billing you for it. Blocks reads as AWS deciding it wants that layer back.

I'm suspicious of the second goal. I'm also fairly convinced this is the right direction. Both things are true at once, and that's what makes Blocks worth talking about.

---

### What Blocks actually is

Blocks is an open-source TypeScript framework where the code you write for your backend becomes the AWS infrastructure that runs it. The industry term for this is Infrastructure-from-Code (IFC), and it's a different animal from the Infrastructure-as-Code (IaC) we're used to.

With IaC, you declare your infrastructure in a separate place from your application. A Terraform file or a CDK stack describes a database, and your app code consumes it. With IFC, the infrastructure grows out of the app. You instantiate a key-value store in your code, and at deploy time that line *is* a DynamoDB table.

None of this is brand new, which AWS's framing quietly skips over. Encore.ts and Nitric have done Infrastructure-from-Code for a few years. You declare a database or a queue as a typed object in your app code and the framework provisions it. Encore runs a real Postgres locally and maps the same declarations to RDS on deploy, and it already pitches itself as backend infrastructure "for humans and agents," which should sound familiar. Nitric goes multi-cloud by compiling those declarations down to Terraform or Pulumi underneath. The pattern has been proven for a while, and it stayed niche.

You get composable primitives across the usual categories: `KVStore`, `Database`, and `FileBucket` for data, `AuthBasic` and `AuthCognito` for auth, `CronJob` and `AsyncJob` for compute, plus `Agent` and `KnowledgeBase` for the AI side. Run `npm run dev` and you get a working app locally with a Postgres database and authentication, no AWS account required. Deploy, and the same code runs on Lambda, DynamoDB, Aurora, and Bedrock with no changes.

---

### Why tying code to infrastructure is a good idea

I spent eleven years running Simpli, a software house that delivered 50+ products for clients of every size. The thing nobody tells you about that model is how much of the work is plumbing that has nothing to do with the product. Every new app meant wiring up the same backend scaffolding, and someone on the team babysitting a deploy that drifted from what the code assumed. A small team can't staff a dedicated infra person per project, so the knowledge lived in one or two heads, and those heads became bottlenecks.

The real problem with how most of us handle infrastructure today isn't the tooling. Terraform and CDK are genuinely good, explicit and reviewable. The trouble is that they keep infrastructure in a separate mental model from the application. You describe a table in one file, consume it in another, and over time the two drift apart. The developer writing the feature has to hold both models in their head and keep them in sync by hand.

Blocks collapses that gap. When the table definition and the code that reads from it are the same construct, they can't drift. For a working developer that's a genuine ergonomic win.

---

### What the code looks like

Here's the shape of it, roughly as the preview API reads today:

```typescript
import { KVStore, AuthBasic } from "aws-blocks";

const auth = new AuthBasic(app, "auth");
const todos = new KVStore(app, "todos");

export const addTodo = auth.handler(async (user, text: string) => {
  await todos.put(`${user.id}:${Date.now()}`, { text, done: false });
});
```

Locally, `todos` is an in-memory store and `addTodo` is just a function you can call from a test. On deploy, that same `KVStore` becomes a DynamoDB table and the handler becomes a Lambda behind API Gateway. One declaration, different behavior in each context. That's the whole pitch in five lines.

---

### The catches, and the escape hatches

The loudest concern I see from developers is the one I'd raise myself. When `new KVStore(...)` quietly provisions cloud resources, deleting that line reaches into your live infrastructure. What happens to the underlying table and its data then depends on the removal policy Blocks assigns. CDK's own default is to retain stateful resources, so you'd more likely orphan the table than wipe it, but in a preview framework I wouldn't stake production data on a default I hadn't checked myself.

The abstraction is convenient until it leaks, and abstractions always leak eventually. I wrote about [where this kind of indirection stops paying for itself](https://gil.solutions/blog/when-dependency-injection-goes-too-far) in a different context, and the lesson transfers. An abstraction is a tool you reach for when it earns its place.

To its credit, Blocks doesn't pretend the abstraction is total. There are honest escape hatches. You can drop into raw CDK in an `index.cdk.ts` file to wire up a service Blocks doesn't cover yet, like SQS. `fromExisting` wraps resources you've already deployed. And when you need full control, you can vendorize a Block, pulling its source into your repo. The common case is automated and the specific case stays reachable, which is the right shape for something aimed at production.

AWS's product page promises "no ceiling on what you can build." I'd push back on that. Today, every API method runs inside a single Lambda, the so-called Lambda-lith, with one memory ceiling and one timeout for everything. That's fine for a prototype or a small-to-medium API. It is not a microservices architecture, and pretending otherwise would set teams up for a painful rewrite.

To be fair, the single Lambda is just the current default. Anything you model as an `AsyncJob` or `CronJob` already deploys as its own function, so you can peel heavy work off the lith today, and the raw-CDK escape hatch lets you stand up more compute by hand. What Blocks won't do for you yet is split the API surface itself into per-method functions, so granular scaling and IAM per endpoint aren't on the table. The developers who've dug into it expect that to change, and so do I. I just wouldn't design around a promise.

_Update (June 2026): after this piece went out, a member of the AWS Blocks team reached out to me to confirm they recognize the single-Lambda limitation and are already working on it. I'll take that as a good sign, and as confirmation the team sees the ceiling the same way the rest of us do._

---

### The AI-agent premise, and where it ties to my own work

The part of the pitch I keep coming back to is the agent framing. Blocks ships with steering files that guide a coding agent toward correct architecture without custom setup. You prompt "add authentication and a database," and the framework constrains the agent so the output actually deploys to production-grade services instead of something that compiles and then falls over.

I find that compelling because I've built the same idea at a smaller scale. At Mosaic, we worked on pre-audited, composable smart contract modules with AI tooling that generated contract compositions from natural language. The whole point was to give the agent a safe vocabulary so a non-expert could assemble something sound. Blocks is doing that for AWS backends. It's also the argument I made in [Discovery and Spec](https://gil.solutions/blog/discovery-and-spec-the-missing-harness-in-ai-assisted-defi-development). If an agent is going to write your code, the leverage is in constraining it *before* the first line. Reviewing the mess afterward is the expensive path.

So when AWS attaches its name to "the correct way to let an agent build a backend," I think the standardizing effect is real. The weight of that name will push IFC from a niche idea toward a default, the same way it does with most things AWS commits to.

---

### Where I land

Lowering the infrastructure barrier doesn't make infra specialists less important. It changes who you call them for. The abstraction handles the common path, and you bring in the person who understands DynamoDB access patterns or the Lambda-lith's limits exactly when the abstraction leaks. At 33Labs I came to a similar conviction about security. The expert's value shows up at the architecture stage, underneath the easy path, well before any clean-up is needed.

What does change is the default expectation for everyone else. When standing up real infrastructure costs five lines, "I just write the app, ops is someone else's job" stops being a defensible position for a backend or fullstack developer. Blocks is one more nudge toward every product developer also owning the deploy. I think that's mostly healthy, and I'd have killed for it during the Simpli years.

The lock-in is real, and I'd keep my eyes open about it. But it's leaky lock-in. It's open-source and runs locally on top of CDK. What you're actually adopting is an AWS-shaped way of thinking about your backend, and that mindset is stickier than any single resource definition. Whether it's a fair trade is the question every team should answer on purpose, before the abstraction quietly makes the decision for them three months in.

---

If you're building a product or just interested in improving your process, feel free to connect or message me. I'm always open to exchanging ideas and learning from other builders.

---

_Written by Gil, a fullstack developer with 19+ years of experience, passionate about practical architecture, clean UX, and blockchain-powered applications._
