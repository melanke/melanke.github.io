---
linkedin-post: |-
  🤔 AI writes the code in seconds now. So why does shipping feel harder, not easier?

  A year into the AI coding boom, the constraint didn't vanish. It moved. Writing was never the real bottleneck. Deciding whether code is safe to merge was, and still is.

  The article digs into what that does to a team. Why parallel agents make dependent work worse. Why "just make small PRs" quietly fails. And the question nobody wants to answer, who's accountable when an agent wrote it and no human read the diff?

  With Bun's Zig→Rust rewrite, Uncle Bob telling everyone to stop reading the code, and an old XP idea that suddenly fits again.

  If you lead a team bringing AI agents into how you actually ship, I'd love your read. 👇

  hashtag#SoftwareEngineering hashtag#AI hashtag#SoftwareDevelopment hashtag#EngineeringLeadership hashtag#CodeReview hashtag#AIAgents hashtag#TechLeadership hashtag#DeveloperProductivity
twitter-post: |-
  AI writes the code. You ship faster.
  Now someone has to trust it. Do you? 🧵
  ---
  Teams with heavy AI adoption merge ~98% more PRs, while median review time climbs ~91% (Faros AI, across 10k devs).

  And an agent-authored PR waits 5x longer to get picked up than a human's (LinearB).

  Faster fingers. Longer queues.
  ---
  Writing code was rarely the real constraint on a healthy team. Deciding whether code is safe to merge was, and still is.

  AI multiplied the cheap half of the job and left the expensive half sitting exactly where it was.
  ---
  Surprise from Google Research: on dependent work, adding agents made output 39-70% WORSE (180 configs).

  So the real skill isn't prompting. It's carving a feature into slices that don't need each other. Decomposition moves upstream, into spec.
  ---
  AI raised code generation ~10x. It didn't touch the ceiling that matters: how much change your team can actually understand and stand behind per unit of time.

  Generate past that and you're not fast. You're piling up unreviewed liability.
  ---
  Bun pointed ~60 Claude agents at itself and ported 535k lines of Zig to 1M+ of Rust in ~11 days. Nobody read the diff.

  Uncle Bob now says stop reading agent code entirely. So who's accountable when the author is an agent and the reviewer is another agent?
  ---
  Honest question for anyone shipping AI-written code at scale: what actually earns your trust now, reading the critical paths yourself, adversarial agents, a test gauntlet, or a second human on the code from the first keystroke?
  ---
  Full piece, on why the bottleneck moved from writing code to trusting it:
  https://gil.solutions/blog/ai-moved-the-bottleneck-from-writing-code-to-trusting-it

  #SoftwareEngineering #AI #CodeReview
og-image-prompt: "A 16:9 wide technical illustration on a near-black, deep-navy background. Visualize a bottleneck: from the left, a broad, dense torrent of small rectangular code blocks and pull-request cards in luminous electric blue streams rapidly toward the right, funneling into a single narrow, glowing vertical checkpoint gate at the center-right; past the gate only a thin, sparse trickle of blocks continues onward, so the wide inflow visibly dwarfs the thin outflow and the narrow gate reads as the clear constriction. Style: minimal, slightly abstract, precise vector aesthetic, subtle grid and depth, no people, no stock-photo imagery, no literal text. Palette: near-black / deep-navy base, electric-blue code streams, a single warm amber accent glowing at the checkpoint gate. Mood: technical, serious, precise. Composition: horizontal left-to-right flow, heavy mass on the left, luminous narrow neck center-right, thin output on the right. 16:9 aspect ratio."
twitter-image-prompt: "A 16:9 wide, feed-stopping technical illustration on a near-black / deep-navy background, clean minimal vector style. Central image: a vast, towering wall of faint machine-generated source code, thousands of dim monochrome electric-blue lines receding into depth, overwhelming in sheer volume. At the very bottom foreground sits a single bright, isolated approval element: an empty sign-off line with an unchecked approval box, glowing emerald, clearly unresolved against the enormous code wall above it, so the contrast reads as massive scale versus one missing human signature. Include a short bold uppercase text overlay reading 'WHO SIGNS OFF?' in crisp white with a subtle electric-blue-to-purple glow, positioned top-left, kept clean and on-brand. Accents: electric blue, purple, emerald. No people, no cyberpunk or meme styling, no stock photos. Mood: technical, precise, quietly ominous. Composition: a dominant vertical wall of code filling the frame, one small luminous unchecked sign-off as the focal point low in the frame, bold text overlay top-left. 16:9 aspect ratio."
twitter-engagement-queries:
  - query: '"reviewing AI code" (slow OR bottleneck OR backlog OR overwhelmed) min_faves:15 within_time:30d -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en'
    targets: devs venting that reviewing AI-generated code has become the slow part
    why: core thesis, AI multiplied writing so the constraint moved to review and trust
    angle: drop the Faros number (98% more PRs merged, +91% review time across 10k devs) and note review capacity, not typing, is the real ceiling now
  - query: '(AI OR agent) (PR OR "pull request") (backlog OR queue OR "piling up" OR "waits longer") min_faves:20 within_time:30d -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en'
    targets: people noticing AI pull requests pile up or wait longer to merge
    why: overlaps the LinearB finding that agent-authored PRs wait 5x longer for pickup
    angle: cite LinearB (agent PRs wait 5x+ longer to get picked up) and that generating past review capacity just piles up unreviewed liability
  - query: '(AI OR agent OR LLM) code (accountable OR accountability OR "who is responsible") min_faves:15 within_time:30d -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en'
    targets: debates over who is accountable for AI-written code
    why: the article's central question, an agent is an accomplice, not a culprit
    angle: reframe code review as manufacturing a second human signature, which a rubber-stamp on a 4,000-line agent diff can no longer supply
  - query: '"vibe coding" (production OR bug OR security OR broke OR incident) min_faves:25 within_time:30d -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en'
    targets: stories of vibe-coded code breaking in production
    why: overlaps the trust and quality-risk thread in the article
    angle: share the Aikido figure and the read-what-matters-pray-over-the-rest triage for where that trade is and is not safe
  - query: '"AI generated code" (security OR vulnerability OR breach OR unsafe) min_faves:20 within_time:30d -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en'
    targets: people worried about the security of AI-written code
    why: overlaps the Aikido 2026 finding cited in the article
    angle: note roughly a quarter of production code is now machine-written while AI code is behind about 1 in 5 enterprise breaches, and the weight lands on whoever clicks merge
  - query: '(Bun OR "Zig to Rust") (AI OR Claude OR agents) (review OR unreviewed OR tests) min_faves:20 within_time:30d -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en'
    targets: discussion of the Bun Zig-to-Rust agent rewrite and whether it was reviewed
    why: the article uses Bun as the frontier case of nobody reading the diff
    angle: add the mechanics, one agent writes each file while two fresh adversarial agents review, human sign-off is maintainer plus green tests, plus Kelley's unreviewed slop pushback
  - query: '("Uncle Bob" OR "Robert Martin") (AI OR agents OR tests OR review) min_faves:15 within_time:30d -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en'
    targets: reactions to Uncle Bob saying he no longer reads agent-written code
    why: the article stages Uncle Bob (trust the gauntlet) against Kelley (unreviewed slop)
    angle: point out this is the sensors-maximalist bet stated as doctrine and ask what earns trust when author and reviewer are both agents
  - query: '"pair programming" (AI OR agent OR dead OR comeback OR back) min_faves:15 within_time:30d -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en'
    targets: takes on whether pair programming is dead or newly relevant with AI
    why: the article's closing provocation, two humans steering one agent for high-stakes code
    angle: cite the triadic-programming study (pairs interrogated AI suggestions more, accepted less) and frame pairing as restoring the second signature at birth
# reddit-posts: RESEARCH DEFERRED — all Reddit hosts (old/www/json) blocked this run (2026-07-28).
#   Do not treat as "no fit". Fit-ranked candidates to research live before posting:
#   1. r/ExperiencedDevs — strongest fit (accountability, review-as-second-signature, AI team process).
#      Strict on self-promo: must be a pure text discussion post, blog link omitted or secondary at most.
#   2. r/ClaudeAI — good fit (article is Claude-centric: Bun ran ~60 Claude agents, Anthropic owns Bun). More promo-tolerant.
#   3. r/programming — weak/risky (opinion blogspam often removed). Fit-gate again with real data.
#   drop: r/ChatGPTCoding — low fit (tool/tips oriented, not a process essay).
---

AI writes the code. You ship faster. Now you have to trust it. Do you?

A year in, a lot of teams got the first half of that pitch and not the second. More code than ever, and delivery that somehow feels slower.

That gap is the whole story. AI didn't remove the work. It moved the work to a part of the process most teams never staffed for.

---

### The bottleneck was never the typing

Teams with heavy AI adoption merge roughly 98% more pull requests while median review time climbs about 91%, according to [Faros AI's 2025 telemetry](https://www.faros.ai/ai-productivity-paradox) across 10,000 developers. And in [LinearB's 2026 benchmarks](https://linearb.io/dev-interrupted/podcast/linearb-2026-benchmarks-ai-pr-merge-rate), an agent-authored PR waits over five times longer to get picked up than a human-written one. Faster fingers, longer queues.

Writing code was rarely the real constraint on a healthy team. Deciding whether code is safe to merge was, and still is. AI multiplied the cheap half of the job and left the expensive half sitting exactly where it was.

OpenAI has a name for the response: [Harness Engineering](https://openai.com/index/harness-engineering/). The model is one component, and the spec plus the gates around it are the harness that makes it reliable. Ryan Lopopolo's framing is blunt, humans steer and agents execute. Martin Fowler splits the harness into guides that steer the agent before it acts and sensors that catch what it did after. I wrote about the upstream half of this, the discovery and spec work that constrains an agent before it writes a line, in [Discovery and Spec](https://gil.solutions/blog/discovery-and-spec-the-missing-harness-in-ai-assisted-defi-development). This piece is about what happens to a team's rituals once you take the harness seriously.

---

### The breakdown became two jobs

Before AI, a task was sized to one thing, how much a person could build in a sitting. That single number quietly did two jobs. It scoped the work, and it scoped the review.

AI pulls those two apart.

The unit a developer *owns* gets bigger. One engineer can now hold a whole feature and drive an agent through it, where that used to be three people's worth of typing. But the unit of *change*, what actually lands as a PR, has to get smaller and, more importantly, independent.

Independent matters more than small, and this is the part that surprised me. Parallel agents don't help on dependent work. Google Research ran 180 agent configurations and found that when step N depends on step N-1, adding agents made the output *worse*, by 39 to 70%. Agents can't coordinate mid-flight the way two people at a whiteboard can. So the breakdown's new job is to carve a feature into vertical slices that don't need each other, then let one agent own each slice.

Which means the decomposition itself becomes the valuable human work, and it moves upstream into spec. Running a 30-person software house at Simpli, breaking an epic into clean, ownable tasks was already the hardest thing a lead did well. AI didn't automate that skill. It raised its price.

---

### You can't merge faster than you can understand

Here's where the "just make small PRs" advice quietly fails.

Small PRs are necessary. Under 200 lines, one logical change, easy to reason about. But split a feature into ten small PRs and they usually depend on each other, so you're back to a tangled queue where PR #6 can't merge until #3 lands. Stacked PRs fix that. Instead of one big branch, you open a chain of small PRs where each one targets the branch below it, forming an ordered stack that ends on main. The dependency order becomes explicit and every link stays small enough to actually review. This used to require third-party tools like Graphite or Sapling; GitHub started rolling out [native support for it](https://github.github.com/gh-stack/) this year, in preview. A merge queue then serializes integration so those PRs land in order without stepping on each other, and feature flags let you merge an unfinished slice without releasing it.

All of that organizes the flow. None of it raises the ceiling.

The ceiling is how much change your team can actually understand and take responsibility for per unit of time. AI raised code generation by something like 10x. It left that understanding-and-review ceiling exactly where it was. A team generating more than it can review isn't moving fast, it's building a pile of unreviewed liability that ages in a queue, which is precisely what that five-times-longer pickup is measuring.

The move most advice skips is to throttle generation down to review capacity. Cap the work in flight to what humans can genuinely absorb, and spend your engineering effort raising that capacity with better sensors and cleaner slices, instead of raising output nobody can vet.

There's a real trade-off here. It means deliberately leaving agent horsepower on the table. You'll have the capacity to generate code you choose not to generate, and that feels wasteful to anyone watching a velocity chart. The alternative is worse. Merged code you didn't understand isn't throughput. It's debt with your name on the commit.

---

### So who is actually accountable?

That phrase, your name on the commit, is where this gets interesting.

Strip code review down to its real function and it isn't about catching typos. It's about getting a second human to put their name on the code. Once a reviewer approves, two people are responsible for that decision instead of one. The shared accountability is the point. The bug-catching is a bonus.

AI breaks that quietly. When you build a feature with an agent, you have a co-author but not a second accountable party. The AI is an accomplice, not a culprit. It can't be paged at 3am, it can't answer for a decision in a post-mortem, and it owns nothing. Push an agent-built PR through a rubber-stamp review and the accountability that review used to manufacture has silently collapsed back onto one person.

That isn't a philosophical worry, it's already written down. Read the terms of service on any of these coding tools and the vendors are blunt, correctness and safety and legal compliance are the user's problem, not theirs. The contract already dropped the full weight on the human. And the weight got heavier, not lighter. By [2026 estimates](https://www.aikido.dev/reports/2026-state-of-ai-in-security-development) AI-generated code is behind roughly one in five enterprise security breaches, while about a quarter of all production code is now machine-written. Responsibility didn't spread out across the team and the tool. It concentrated on whoever clicks merge, right when the code became hardest to trace back to a decision a person actually made.

Which is why some researchers now say the real question isn't who is responsible but whether responsibility can even be shown anymore, once code stops being written in a straight, traceable line. A rubber-stamp approval was always a weak signal. Against a 4,000-line agent diff, it's close to no signal at all.

You can watch this play out at the frontier. This year Bun, a JavaScript runtime now owned by Anthropic, pointed around sixty Claude agents at itself and [ported the whole thing from Zig to Rust](https://bun.com/blog/bun-in-rust), turning roughly 535,000 lines into more than a million in about eleven days. Nobody read that diff. At that size no human could. So the review was handed to other agents. For each file one Claude wrote the Rust, two fresh Claudes in separate sessions attacked it for regressions and behavioral drift, and another applied the fixes. The human sign-off was the maintainer confirming it ran and the test suite going green.

That's a genuinely clever harness, and it's also the accountability problem in its purest form. When the author is an agent and the reviewer is another agent, nobody puts their name next to an opinion. Andrew Kelley, who created Zig, called the result ["unreviewed slop"](https://www.theregister.com/devops/2026/07/14/zig-creator-calls-buns-claude-rust-rewrite-unreviewed_slop/5270743) and asked the obvious question. If a test suite wasn't trusted to catch every bug in the hand-written Zig, why is it suddenly trusted to bless a million lines of machine-written Rust? You can dislike his tone and still feel the weight of it. The honest version of review at this scale isn't review. It's choosing the few paths that would hurt most if they broke, reading those, and trusting tests and adversarial agents for everything else. Read what matters, pray over the rest.

Uncle Bob goes further than pray over the rest. He doesn't read the code his agents write at all. That's Robert C. Martin, who wrote *Clean Code* and spent decades teaching a generation of engineers to treat every line as something they own and answer for, about as close to a conscience as this field has about the craft. The man who made caring about code into a discipline now says the only way to profit from AI is to [stop looking at it](https://x.com/unclebobmartin/status/2080257779395154409). He replaces reading with a gauntlet, unit tests, mutation testing, coverage, quality metrics, and banks whatever survives. It's the Bun bet restated as doctrine rather than emergency. Where Kelley sees unreviewed slop, Uncle Bob sees code that ran a harder exam than any human reviewer would set, and both are staring at the same fact that no person read it.

Martin isn't wrong, and for a lot of software that trade is exactly right. I suspect it's where much of the industry lands. Plenty of code fails cheaply, and tests plus adversarial agents are a sane bet when a miss costs little. So take that as the first answer, and a real one. But it isn't the only shape on the table, and it breaks down exactly where the stakes rise, on the code where a silent behavioral drift costs real money or real trust and "pray over the rest" stops being something you can say out loud.

For that code, the other answer is older than the problem. Extreme Programming's pair programming put two humans on the code as it was written, both responsible from the first keystroke. We spent a decade calling it too expensive. What if two people steering one agent is exactly the shape the AI era needs for the code that actually has to be right?

I went looking to see if anyone was serious about this, half expecting nothing. There's early research. A 2026 study on [Human-Human-AI "triadic" programming](https://arxiv.org/abs/2601.12134) compared one person plus an AI against two people plus the same AI, and the pair came out measurably more accountable. They interrogated the AI's suggestions instead of waving them through, and accepted noticeably less of the generated code. Putting a second human in the loop made the AI's use visible, something a peer could see and question in the moment, and the partner acted, in the authors' words, as a critical accountability mechanism. The interesting part isn't that two people catch more bugs. It's that the code never gets born without a second human already on the hook for it.

That's early signal, not a mandate, and I'm not about to tell a team to pair-program everything. But it points somewhere uncomfortable and worth sitting with. If a single reviewer can no longer supply the second signature that actually matters, accountability may have to move back to where the code is born, with two humans steering the agent together. Not to type faster. To make sure someone other than the machine understands what shipped.

---

AI handed every developer a printing press and left the newsroom the same size. The interesting story on real teams over the next few years isn't the press. It's who reads the proofs, and whose name runs under the headline.

---

If you're building a product or just interested in improving your process, feel free to connect or message me. I'm always open to exchanging ideas and learning from other builders.

---

_Written by Gil, a Tech Lead with 19+ years in software and 12+ years leading teams of up to 30, now focused on bringing AI agents into how teams actually work without losing the humans who own the code._
