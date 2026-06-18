# External Surface in Solidity: Interfaces in Their Own Files and NatSpec That Pays Off in Audits

Original titles:
- Usar interfaces em arquivos externos, incluindo erros, eventos, structs, todas funções external/public
- Como e onde escrever Natspec e @inheritdoc

> **Merged**: combines the original `interfaces-arquivos-externos.md` and `natspec-inheritdoc.md` topics — both habits operate on the contract's *external surface* (what consumers and auditors read first), and the natural pairing is "write the surface in a separate file AND document it well there once via NatSpec, then `@inheritdoc` everywhere else".

## Related Lessons

- [02 #8 — Interfaces as separate files](02-runtime-size-optimization.md)
- [06 #6 — Interfaces in separate files](06-architecture-patterns.md)
- [08 #2 — `@inheritdoc` instead of duplicating NatSpec](08-code-style-conventions.md)
- [08 #6 — Comments explain "why", not "what"](08-code-style-conventions.md)
- [08 #16 — Explanatory comments for non-obvious reverts](08-code-style-conventions.md)
- [08 #10 — @custom:security-contact](08-code-style-conventions.md)
- [09 #14 — Custom security contact](09-audit-preparation.md)
