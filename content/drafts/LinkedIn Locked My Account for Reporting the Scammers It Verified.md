[HOOK — refinar]

Last week I posted a short warning on LinkedIn about the fake recruiters flooding developer inboxes. It went further than anything I've written there ([the post is here](https://www.linkedin.com/feed/update/urn:li:activity:7488934010866307072/)), and the comments were the real story: dozens of engineers describing the same conversation, almost word for word. Same pitch, same repo, same "quick technical task before we schedule the call".

I work on DeFi protocols at 33Labs, and 8 of my 19 years in software have been in Web3. Crypto experience plus a public GitHub plus remote-friendly makes for a well-priced target. The messages arrive constantly, and they have gotten good.

What follows isn't a checklist. It's far too long to work through item by item. Reading the full set is about pattern recognition. Once these are in your head you spot them early and stop donating your evenings to a script.

---

### 1. First impressions of the profile

1. **Recently created account.** Check the first activity and the first post. A senior recruiter with no history before this quarter is not a senior recruiter.
2. **Connection count out of line with the claimed seniority.** A senior tech recruiter with fewer than 500 connections is anomalous. Recruiting is a networking job, the number is the resume.
3. **Almost no activity.** No original posts, only reshares.
4. **No written recommendations.** Recommendations are expensive to fake because they require another real account to write a paragraph and stake its name on it.
5. **Stated location inconsistent with message timing.** If they're in Berlin and reply at 3am Berlin time, consistently, they're not in Berlin.
6. **Default profile URL with the long hash** (`/in/name-surname-68a880253`). Nobody who lives on LinkedIn professionally leaves that untouched. It means the account was never edited, which usually means it's new.
7. **The listed company page is thin.** Created a few months ago, few followers, and no employees except the "recruiter" who messaged you.

---

### 2. The profile photo, generated

AI headshots are now the default for these accounts, and the giveaways people used to rely on (mangled ears, melted jewelry, impossible glasses frames) are mostly gone. Run the image through a detector instead of squinting at it:

- [sightengine.com/detect-ai-generated-images](https://sightengine.com/detect-ai-generated-images)

Treat the score as one weak signal. Detectors produce false positives on heavily edited real photos and false negatives on good generations. A high AI score plus a three-month-old account plus a Telegram request is a conclusion. On its own it's nothing.

---

### 3. The profile photo, stolen

The other half of the accounts don't generate a face, they take one. Reverse image search is still the fastest disqualifier, and the tools are not interchangeable:

- **Yandex Images** is the best free option for faces. Its facial matching genuinely outperforms the others.
- **Google Images** is strongest at exact-copy matches and general web presence.
- **TinEye** traces origin and modifications. Sort by "oldest" to find the first appearance of the image, which is usually the actual owner's account or a stock photo listing.
- **PimEyes** runs neural networks trained specifically on faces, and it's the one that finds a person when the photo has been cropped or filtered.

If the same face shows up as a dentist in Ohio in 2019, you're done.

---

### 4. How they write

This is where the good operators separate from the bulk senders.

1. **Shallow personalization that doesn't survive a second layer.** In the documented case, the recruiter had clearly read the target's LinkedIn and could name his real work. But the materials underneath, the job doc and the repo, were mass-produced. The test: ask a specific technical question about why *you* fit this role. A generic answer after a personalized opener is the tell.
2. **Above-market salary with no justification.** An unusually generous number is bait, not an offer.
3. **Manufactured urgency.** "We need an answer in 24 hours." Real processes have stages and give you reasonable time. Fake ones push you to act before you think.
4. **Skipped stages.** An offer or a "next phase" before any real evaluation has happened.
5. **Fast migration off-platform.** Telegram, Discord, WhatsApp, early and insistently. Off LinkedIn there's no report button and no history.
6. **Strange response latency.** Answers arriving instantly in blocks, then nothing for hours. That's a queue being worked, not a conversation.
7. **The same opening message reported by other developers.** Paste an exact fragment into Google, X, or Reddit. These templates get reused thousands of times.
8. **Can't answer basic questions.** Who would be my manager, how big is the team, what's the stack, how is compensation structured, is there equity. A real recruiter answers or says "let me check".
9. **Avoids putting anything verifiable in writing.** Won't use a corporate email, won't send the job description as a PDF from the company domain.
10. **Reacts badly to verification questions.** Irritation, rushing, or making you feel rude for asking. A legitimate recruiter is used to being checked.
11. **Insists you run the code on your main machine**, usually with a "we need it in the team environment" excuse. This is the actual objective of the entire conversation.

---

### 5. The task, and the logistics around it

1. **The core request** is always some version of: clone this repo, run the flow, suggest improvements, complete a small task to prove your expertise.
2. **The project theme** is almost always a blockchain game, a crypto casino or betting product, a DEX, a wallet, or a trading bot. If you work in Web3, the pitch is tailored enough to feel plausible.
3. **Hosted on Bitbucket**, presenting itself as a game with blockchain features. Bitbucket shows up far more often than its market share would suggest.
4. **Private repository with an individual invite.** This is deliberate. The community can't inspect it, and it disappears the moment it's reported.
5. **A tight deadline** on the challenge.
6. **Insistence on a live "code review" with you sharing your screen**, so they can watch you run it.
7. **Personal email instead of corporate.** A one-letter-off domain, or a job description sent from a Gmail or ProtonMail account.
8. **Known brand, wrong domain.** Claiming to work for a company everyone recognizes while emailing from `@gmail.com` and listing an office that doesn't exist.
9. **The documented address pattern**: Gmail accounts with a numeric suffix, plus lookalike domains like `crew@ritualhub.net`.
10. **The calendar invite is a forensic goldmine.** Download the `.ics` and read it as plain text. Look at the `ORGANIZER` field and the real email behind the display name, the event timezone, the `PRODID` that reveals which client created it, and the domain of the conference link.
11. **A shared Google Doc of "open roles"** instead of the company's actual careers page. In the Ritual impersonation, the doc even listed the company's real investors to build credibility, alongside a Calendly link. Check the doc's owner and its revision history.
12. **A proprietary video conferencing app you have to install.** No legitimate employer requires this for an interview. Zoom, Teams, and Meet exist and everyone uses them. This one is close to a universal rule.

---

### 6. On the video call

1. **Camera off from the start, blamed on bandwidth.** In the documented case the interviewer killed his video the instant the call started. Pindrop's research found that 79% of candidates involved in assessment fraud conducted interviews with the camera off. It isn't proof, but it belongs in the stack with everything else here.
2. **Camera on briefly, then "connection issues".** What you saw was probably not a live webcam. These operations inject pre-edited video into the WebRTC transport as if it were a live feed, with AI-generated headshots composited onto real body movement captured in earlier meetings. Every successful attack feeds the footage library used against the next target.
3. **Audio-video desync.** Lips slightly off the words, or a small consistent delay through the whole conversation. That's usually a rendering problem in the deepfake pipeline.
4. **Anything covering the mouth.** Hand on the chin, oversized microphone, mask, constant smoking or drinking.
5. **The most dangerous version: the person is real and has no idea.** Some of these operations run a legitimate screening interview with a real contractor who was hired to do exactly that. The call is genuine, it builds all the credibility they need, and the payload arrives afterwards over chat.

---

### 7. The repository

If you got this far and you're still considering running the code, this is the last gate. Most of it is metadata you can check in under five minutes.

1. **Bitbucket and GitLab are preferred over GitHub.** Microsoft lists all three as platforms used in these campaigns, with a concrete Bitbucket example. GitLab documented projects on its platform acting as obfuscated loaders for payloads like BeaverTail and OtterCookie hosted elsewhere, and banned the repos. The practical reason is less automated security scanning and slower takedowns.
2. **A real IOC**: `bitbucket.org/0g_labs/rollplay-i`, a sibling repo in the same campaign.
3. **Recently created organization** with no other projects, no org README, no public members.
4. **A single member**, or members who are all empty accounts.
5. **Org name nearly identical to the real company**, with a hyphen or suffix. `0G-Labs-IO` and `0g_labs` impersonating 0G Labs. `ritualPlay-Net`, `RitualProg/MetaPlay`, `RitualGame/MetaPlay` impersonating Ritual. `Bluwhale-Games/DeepWhale`.
6. **No stars, no forks, no issues, no PRs, no releases, no tags.** A project that supposedly has users has some of these.
7. **Contributor accounts all created in the same month**, with default avatars or AI headshots.
8. **Synthetic activity.** Contribution grids filled in artificially, evenly, with no weekends and no vacations.
9. **Private repo with a direct invite**, which is where the payload files usually live.
10. **Mismatch between repo creation date and oldest commit.** In one analyzed case the API reported `fork: false`, the project was created on July 3rd 2026, and the oldest commit was dated December 2015. No repository carries commits from eleven years before it existed unless somebody pushed that history in.
11. **The disguised fork.** Instead of clicking Fork, which would mark the page with a "forked from" banner and file the project in the parent's network graph, the operators clone a real, long-lived open source project locally, graft the game and the malware on top, and push it as a brand new repo. That severs the link to the original. There's no banner and nothing for a scanner to diff against a known-good parent, and the project inherits a decade of apparent maturity.
12. **Unsigned commits across 100% of recent history**, particularly on the commits that introduce the payload.

I'll admit sometimes I keep the conversation going after the flags are obvious, precisely because I want the repo link. Then I go find the payload and report the repository or the owner. GitHub takes those down. That report button still works, which is a strange thing to have to say out loud.

#### The rule that makes all of it optional

If you take one thing from here, take this instead of the list: **never run unfamiliar code on the machine where your keys live.**

---

### The LinkedIn Verification Badge Is Bull***t

How many of the scammers who messaged me had a verification badge? All of them.

In early June, LinkedIn locked my account. No warning, no specific reason given. The only unusual thing I had been doing was reporting a lot of profiles as scammers, which is exactly what the platform asks you to do. It took me two months to get it back, and it only moved after I filed a public complaint on "Reclame Aqui". Two months without the professional network I need for work, because I used the report button too often.

Today I don't report anymore. I only block, afraid of loosing my account again. Imagine how I feel about this.

---

_Written by Gil, a Principal Software Engineer with 19+ years of experience, 8 of them in Web3, currently building DeFi protocols at 33Labs — which is exactly the profile these messages are written for._
