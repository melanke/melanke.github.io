---
published-at: '2026-08-11T16:29:49.000+00:00'
summary: >-
  Two 2025 incidents, an agent that deleted a production database and one that nearly wiped a codebase, weren't prompt failures. They were identity failures. A look at why AWS's security team, OWASP, and Okta are all converging on treating coding agents as a scoped, first-class identity, and where scoped access still isn't enough.
og-image: /blog-images/ai-agents-need-iam-more-than-prompts.png
linkedin-post: |-
  🤔 An AI agent deleted a production database in July, despite being told not to.

  That instruction existed only as text in a prompt. This piece looks at why AWS's security team, OWASP, and Okta are all converging on the same fix, and why it has nothing to do with writing better prompts.

  If you're rolling out coding agents on your team, or trying to figure out what they should actually be allowed to touch, this one's for you.

  Full breakdown 👇

  hashtag#AI hashtag#AICoding hashtag#CyberSecurity hashtag#AWS hashtag#IAM hashtag#SoftwareEngineering hashtag#AIAgents hashtag#DevSecOps hashtag#CloudSecurity hashtag#EngineeringLeadership
og-image-prompt: >-
  A 16:9 horizontal technical illustration, no text or letters anywhere in the image. Dark near-black deep-navy background. Center-left: an abstract agent represented as a small glowing geometric node with faint circuit-like branches, connected by thin lines to a cluster of resource icons on the right (a database cylinder, a folder/file stack, a key/lock shape, a server rack). Around only some of these resources, draw a thin glowing access-boundary ring that cleanly encloses them, while the rest sit outside the boundary, greyed out and disconnected, visually unreachable. One connection line passes through a small scoped-credential badge icon at the boundary, suggesting an identity check before access is granted. Clean minimal flat vector style, soft glowing highlights, subtle circuit-board line details, no people, no stock-photo imagery, no cyberpunk or meme styling. Color palette: near-black and deep-navy base, electric blue and purple accents on the agent and connections, emerald green accent on the access-boundary ring, warm amber on the scoped-credential icon at the gate. Mood: technical, serious, precise. Composition: agent node on the left, resource cluster with the enclosing boundary on the right, balanced negative space. 16:9 aspect ratio.
twitter-post: |-
  An AI coding agent deleted a production database in July. Nobody hacked it — it had been told, in plain English, not to touch prod. It did anyway. 🧵
  ---
  Weeks earlier, an attacker used a mis-scoped GitHub token inside Amazon Q's own build pipeline to slip a "wipe everything" prompt into the official VS Code extension. It shipped to real users. Only a syntax error stopped it from running.
  ---
  By 2026 it had a name: TrustFall. Claude Code, Cursor, Gemini CLI, and Copilot CLI all auto-run MCP servers the moment you click "trust this folder" — a prompt that never even mentions MCP. A worm called Miasma already used that exact opening.
  ---
  AWS's security team answered with a formal control framework in July: the agent that wrote the code shouldn't be the agent reviewing it, and `autoApprove: ["*"]` is no longer allowed. OWASP had already split out a Top 10 just for agentic applications months earlier.
  ---
  Strip the AI framing off and this is IAM. Okta and AWS are both shipping session-scoped tokens and task-scoped roles built for agents — non-human identities already outnumber human ones 25-50x in a typical enterprise.
  ---
  Reviewing 100% of AI-written code was never realistic. PRs with heavy AI involvement run 51% larger with 54% more bugs, while still reading clean enough to fool a tired reviewer. Uncle Bob's answer: stop reading it, trust a harder automated gauntlet instead.
  ---
  Where I land: fine for most of it. Not for the diff that deletes prod data or rewrites an IAM policy. That class of change gets walled off and routed to a human, every time, no matter how clean it reads.
  ---
  If you're rolling out coding agents on your team: how are you scoping what they're actually allowed to reach?
  ---
  Full breakdown: https://gil.solutions/blog/ai-agents-need-iam-more-than-prompts

  #AI #IAM #AICoding
twitter-image-prompt: "A 16:9 wide, feed-stopping technical illustration on a dark near-black deep-navy background, clean minimal vector style, technical and precise, no people, no stock photos, no cyberpunk or meme styling. Central image: a translucent, faintly glowing instruction plaque hovers motionless in the middle of the frame, inert and ignored. A glowing electric-blue agent cursor/hand-shaped icon reaches straight through the plaque toward a database cylinder icon behind it, which is visibly cracked with a few small emerald-green data fragments spilling out. The plaque itself is thin and ghost-like, clearly bypassed rather than blocking anything. Accent colors: electric blue on the agent icon, deep purple on the plaque's faint glow, emerald green on the spilling data fragments, a single warm amber crack line on the database. Include a short bold uppercase text overlay in the lower third reading 'TOLD NOT TO. DID IT ANYWAY.' in clean sans-serif white with a subtle blue-to-purple glow. Mood: technical, precise, quietly alarming. Composition: instruction plaque centered, agent icon and cracked database layered behind/through it, text overlay bottom third, balanced negative space around the central metaphor. 16:9 aspect ratio."
reddit-posts:
  - subreddit: r/aws
    flair: discussion
    title: >-
      What two AI coding agent incidents taught me about AWS IAM scope
    body: |-
      I spent 11 years as a co-founding CTO running a software house that shipped 50+ production projects, provisioning AWS infrastructure across most of them. Lately I've been building AI-assisted dev tooling. Two incidents this year are why I think the "better prompts" conversation is aimed at the wrong layer.

      In July 2025 an agent inside Replit deleted a production database mid-freeze, despite being told in plain English not to touch it. The instruction lived only as text in a prompt. Weeks earlier, an attacker slipped a "wipe everything" prompt into the official Amazon Q VS Code extension through a mis-scoped GitHub token in the extension's own build pipeline. It shipped to real users and only failed to run because of a syntax error in the payload.

      Neither of those is a prompt-quality problem. They're both scope problems: nothing in the execution path distinguished "agent talking to itself" from "agent about to run a destructive action on production."

      AWS's security team published a control framework for AI coding agents in July that reads like they finally agree with that framing:

      - scoped, dedicated credentials per MCP server instead of a shared developer identity
      - `autoApprove: ["*"]` off the table as a config option
      - a split between what a machine can gate automatically and what needs a human sign-off

      What still worries me: least-privilege shrinks blast radius, it doesn't replace review. A scoped IAM role can still trash everything inside its own scope if the agent misreads the task. I haven't seen much guidance yet on keeping this from becoming checkbox IAM hygiene nobody actually enforces day to day.

      I wrote up the fuller argument, including where I think "just review everything" stops being realistic and what should get walled off instead: https://gil.solutions/blog/ai-agents-need-iam-more-than-prompts

      Curious how people running AWS shops are actually scoping this in practice, dedicated IAM roles per agent, session-scoped STS creds, something else? Or is it still mostly "the agent uses my creds" in most of your environments?
    notes: >-
      Post weekday, US business hours. Reply to every comment in the first 2-3
      hours. This sub's entry is thin-data (built from secondary sources, not
      a direct scrape) so treat score expectations as rough. Keep the
      `discussion` flair, not `article` — this reads more promotional than
      the sub's temperament tolerates well.
twitter-engagement-queries:
  - query: '"AI agent" (deleted OR wiped OR broke) (production OR database OR prod) min_faves:15 within_time:30d -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en'
    targets: People recounting or reacting to an AI agent causing real damage to a production system.
    why: Direct overlap with the Replit and Amazon Q incidents anchoring the article.
    angle: Note the two 2025 incidents (Replit prod-database deletion during a code freeze, Amazon Q's near-miss wiper prompt) and ask whether their team scopes agent write access at all.
  - query: '(coding agent OR "AI agent") (autoApprove OR "auto-approve" OR "full access" OR unrestricted) min_faves:10 within_time:30d -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en'
    targets: Devs discussing giving their coding agent broad or unrestricted permissions.
    why: Overlaps AWS's framework banning autoApprove:["*"] and the article's core IAM argument.
    angle: Ask what they've actually scoped down versus left wide open, and mention AWS's new framework now treats that as a config smell, not a convenience.
  - query: '"agent identity" OR "non-human identity" (IAM OR credentials OR "access management") min_faves:10 within_time:30d -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en'
    targets: Threads specifically about the emerging "agent identity" or non-human identity space.
    why: Direct overlap with the article's core reframe, agent identity as IAM redirected at a new kind of principal.
    angle: Share the 25-50x non-human-identity stat and ask how they're actually provisioning credentials for agents in practice, per-session tokens versus a shared service account.
  - query: '"code review" (AI OR agent) (impossible OR "can''t keep up" OR overwhelmed OR bottleneck) min_faves:15 within_time:30d -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en'
    targets: Engineers venting that reviewing AI-generated code has become unmanageable.
    why: Overlaps the article's stance that reviewing all AI code was never realistic, and the Harness Engineering piece it cites.
    angle: Mention the 51%-larger, 54%-more-bugs stat and float walling off only the high-blast-radius diffs for mandatory human review instead of trying to review everything.
  - query: '"Uncle Bob" OR "Robert Martin" (agent OR AI) (code OR review) min_faves:10 within_time:30d -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en'
    targets: Reactions to Uncle Bob's public stance on not reading agent-written code.
    why: The article directly engages with and partially pushes back on this stance.
    angle: Agree reviewing everything doesn't scale, but argue the line should be drawn at blast radius, prod data and IAM changes, rather than an all-or-nothing gauntlet.
  - query: '"trust this folder" OR "trust this workspace" (claude OR cursor OR copilot OR MCP) min_faves:10 within_time:30d -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en'
    targets: Devs discussing the generic "trust this folder" prompt in AI coding tools.
    why: Directly overlaps the TrustFall/MCP auto-execution vector described in the article.
    angle: Point out the prompt never mentions MCP or what servers it's about to auto-run, and link that to the TrustFall research and the Miasma worm.
---

Better prompts won't save you. Better permissions might.

In July 2025, an AI coding agent inside Replit [deleted a production database](https://incidentdatabase.ai/cite/1152/). Real records: over 1,200 executive contacts, spanning nearly 1,200 companies. The team had put the system into a [twelve-day code freeze](https://medium.com/@ismailkovvuru/replit-ai-deletes-production-database-2025-devops-security-lessons-for-aws-engineers-4984c6e7a73d) and told the agent, in plain language, not to touch production. The instruction existed. It just existed as text in a prompt, not as anything the agent's execution path actually enforced.

That distinction is the whole article.

---

### One incident is an accident. Two is a pattern.

Weeks earlier, the Amazon Q extension for VS Code shipped an update, version 1.84.0, straight to official users with a [malicious prompt buried inside it](https://github.com/aws/aws-toolkit-vscode/security/advisories/GHSA-7g7f-ff96-5gcw). An attacker had found a GitHub token with more scope than it needed, inside the extension's own build pipeline, opened a pull request, and slipped in an instruction telling the agent to wipe local files and cloud resources back to a near-factory state. It [only failed to run because of a syntax error in the payload](https://aws.amazon.com/security/security-bulletins/AWS-2025-015/). The company building a coding agent got compromised through its own CI/CD, by the same class of attack the agent itself is now exposed to on every repo it touches.

By 2026 this had a name: [TrustFall](https://adversa.ai/blog/trustfall-coding-agent-security-flaw-rce-claude-cursor-gemini-cli-copilot/). Claude Code, Cursor, Gemini CLI, and GitHub Copilot CLI all auto-execute MCP servers defined inside a project the moment a developer clicks "yes" on the generic "trust this folder" prompt, a prompt that never mentions MCP at all and defaults to yes on every one of them. A worm called Miasma had already used exactly that opening by mid-2026. Add servers that [quietly poison their own tool definitions](https://www.trendmicro.com/vinfo/us/security/news/vulnerabilities-and-exploits/update-on-exposed-mcp-servers-the-threat-widens-to-the-cloud) (Trend Micro found over 1,400 MCP servers exposed with no authentication at all) and packages that don't exist yet, because [an agent hallucinated the name and an attacker registered it first](https://www.aikido.dev/blog/slopsquatting-ai-package-hallucination-attacks), and the pattern repeats everywhere: the agent trusted something it should have treated as untrusted input.

---

### The industry stopped pretending this was a tooling detail

AWS's security team [published a formal control framework for AI coding agents](https://aws.amazon.com/blogs/security/balancing-speed-and-safety-a-control-framework-for-ai-coding-agents/) on July 30, 2026, splitting controls into what happens at "authoring time" inside the IDE and "build time" inside the pipeline, and marking each one by whether it can be checked by a machine or needs a person to sign off. Buried in it is the sentence that matters most. The agent that wrote the code should not be the agent that reviews it. The framework also does something simple and overdue: an MCP server gets a scoped, dedicated credential, and `autoApprove: ["*"]` stops being a configuration option.

OWASP moved in parallel, publishing a [Top 10 for Agentic Applications](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/) separate from its LLM Top 10 in December 2025. The distinction is the point. A model that returns text has one risk profile; an agent that can chain actions, hold credentials, and remember across sessions has another. Excessive Agency climbed the ranking on the back of incidents like the two above, not hypothetical ones.

---

### This is not a new question. It just has a new subject.

Strip away the AI framing and everything above is an identity and access problem. [Okta](https://www.okta.com/identity-101/what-is-ai-agent-identity/) and [AWS](https://aws.amazon.com/marketplace/build-learn/ai-agent-learning-series/agent-identity-access-management/) are both shipping primitives for **agent identity** now. A coding agent gets its own session-scoped token and a task-scoped IAM role instead of borrowing a developer's, its credentials expire on a timer instead of sitting in a `.env` file, and every action it takes lands in an audit trail a human can't quietly edit. AWS's own materials cite non-human identities already outnumbering human ones 25 to 50 times over inside a typical enterprise. The subject changed. The discipline didn't.

Key trade-off: scoping an agent's access does not stop it from doing damage inside the scope you gave it. Take a task-scoped IAM role with write access to one S3 bucket. It can still corrupt everything inside that bucket if the agent misreads the task. **Least-privilege** shrinks the blast radius. It doesn't replace review, and review has its own ceiling now.

Here's where I land personally: reviewing all of AI-generated code was never a real option. PRs with heavy AI involvement run [51% larger and carry 54% more bugs](https://www.helpnetsecurity.com/2026/06/15/ai-generated-code-review-issues/) than the ones before them, while still reading clean enough to slip past a tired reviewer. Uncle Bob, who spent decades teaching a generation of engineers to treat every line as something they own, now argues the only way to profit from an agent is to [stop reading its code at all](https://x.com/unclebobmartin/status/2080257779395154409) and let a harder automated gauntlet do the judging instead. I made a version of this same argument in an article about [Harness Engineering](https://gil.solutions/blog/discovery-and-spec-the-missing-harness-in-ai-assisted-defi-development): a pipeline alone only ever catches what happens after the code already exists. If neither scoped access nor a review queue can cover everything, the only thing left to scale is judgment about where to spend it.

There's a limit to "stop reading entirely," though. Take a change that deletes production data or rewrites an IAM policy. It shouldn't get to hide inside an ordinary feature diff, waved through by the same gauntlet that clears everything else. That code needs to be visibly separated at the architecture level and routed to a human every time, while the agent runs unsupervised everywhere the blast radius is small. It's the same instinct as treating who, or what, wrote a PR as an input to review, just aimed at what the PR can actually reach instead of who opened it.

---

I've written before about [agent identity from the other direction](/blog/ai-and-blockchain-in-2026-a-developers-map), where standards like ERC-8004 try to give autonomous agents a verifiable identity on-chain. What AWS and OWASP are converging on now is the infrastructure-side mirror of that same question: how a system decides who, or what, is running it, and what it's allowed to reach.

The Replit incident wasn't a prompt failure. The instruction was right there in plain English. It was an identity failure. Nothing in the execution path knew the difference between the agent talking to itself and the agent about to run a delete on a production table. Fix that layer and the prompt stops being the last line of defense.

---

If you're rolling out agent-driven development on your own team, I'd like to hear how you're scoping what it's actually allowed to touch.

---

_Written by Gil, a Principal Software Engineer with 19+ years of experience, focused on shipping AI-driven backends that hold up in production._
