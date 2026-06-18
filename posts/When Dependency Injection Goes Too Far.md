---
linkedin-post: "When does good design become overengineering? \U0001F914\nDependency Injection and the SOLID principles are essential tools for writing clean code—but using them without care can create unnecessary complexity and slow down development. \nIn my latest article, I share my experience working on real projects where dependency inversion was taken too far, why this happens, and how we can apply these principles wisely to keep our code both flexible and simple. \nCheck it out and let me know your thoughts! \U0001F447\n\nhashtag#CleanCode hashtag#SOLID hashtag#DependencyInjection hashtag#SoftwareEngineering hashtag#CodeQuality hashtag#SoftwareDesign hashtag#Programming hashtag#TechLeadership hashtag#DeveloperExperience"
linkedin-url: >-
  https://www.linkedin.com/pulse/when-dependency-injection-goes-too-far-gil-lopes-bueno-f1f7f
summary: >-
  DIP is a tool, not a rule. Two real projects where every class had an
  interface 'just in case' — and the cognitive cost that piled up. When
  abstraction earns its keep, and when it just adds noise.
og-image: /blog-images/when-dependency-injection-goes-too-far.png
published-at: '2025-06-09T12:14:26.000+00:00'
---
The SOLID principles are a cornerstone of modern software engineering. Popularized by Robert C. Martin (Uncle Bob) and coined as an acronym by Michael Feathers, they promote clean, maintainable, and scalable code. These principles—Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion—are especially useful in complex systems where good design is key to long-term success.

The "D" in SOLID stands for **Dependency Inversion Principle (DIP)**. It suggests that high-level modules should not depend on low-level modules, but both should depend on abstractions. This helps reduce coupling, improves testability, and encourages a more flexible architecture. For example, instead of a class depending directly on a PostgresRepository, it should depend on an IUserRepository interface—allowing for alternative implementations like an in-memory version during tests.

In 2018, I was working on an open-source project to reimplement the C# node of the Neo 2 blockchain. My focus was on the RPC server, and I tried to follow the patterns already used in the codebase. But I quickly ran into what I saw as an overuse of dependency injection. Every part of the system had its own interface—even when there was only one implementation, and we knew there would never be another. This led to a split in the team: some developers insisted it was the right way to do things, while others (like myself) felt it was overengineering.

I believe that kind of abstraction is unnecessary and even harmful. As Uncle Bob himself has said, _“You don’t have to abstract everything. You abstract when change is likely or cost of coupling is high.”_ Overusing DIP creates noise in the codebase, increases cognitive load, and often slows down development without offering any real flexibility in return.

In 2022, while working as CTO at Simpli, I came across the same issue again. I wasn’t directly involved with Gasbot, a simple Discord bot for transferring tokens, which was being developed by a mid-level and a junior developer. They reached out to me with a specific question I don’t even remember now—but when I looked at the code, it was déjà vu. Every change to a method signature or new functionality required edits across multiple files and layers of unnecessary abstraction. It turned what should’ve been a simple project into a maintenance headache.

I think this keeps happening because DIP is often misunderstood as a rule to be followed blindly, rather than a tool to be used wisely. Abstractions have a cost, and like any design decision, they should be justified. Clean code isn’t just about following principles—it’s about understanding their purpose and applying them with judgment.

---

_Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology._
