# The Solidity CI You Wish You'd Set Up on Day One: forge fmt, slither, size caps, optimizer pinning, warning-free from line one

Original titles:
- Desde o início, configure o formatting correto, settar o optimizer_runs=1 e use a mesma versão do Foundry que você usa localmente no CI. Desde o início, use CI e/ou git hooks para assegurar formatação, warning-free, tamanho dos contratos aceitáveis, testes passando, StackTooDeep-free, boa coverage, checagem de slither, sem problemas de segurança e contabilidade (usando skill de auditoria)
- Fix and ensure formatting and warnings since the beginning

> **Merged**: combines the original `ci-git-hooks-from-start.md` and `formatting-warnings-since-beginning.md` topics — formatting/warnings are the very first gate every Solidity CI should enforce, so they belong in the same article as the rest of the CI pipeline (slither, size caps, optimizer pinning, Foundry version pinning).

## Related Lessons

- [12 #11 — Basic CI workflow (test + fmt + slither)](12-tooling-development.md)
- [10 #8 — Foundry version pin in CI](10-deployment-operations.md)
- [10 #9 — forge fmt as CI gate](10-deployment-operations.md)
- [07 #13 — Foundry pin + regular reformat](07-testing-strategies.md)
- [12 #13 — Foundry lock file pinning](12-tooling-development.md)
- [02 #7 — Foundry optimizer + `optimizer_runs = 1`](02-runtime-size-optimization.md)
- [01 #10 — Foundry optimizer with `optimizer_runs = 1` when size is the bottleneck](01-gas-optimization.md)
- [09 #1 — Slither + KNOWN_ISSUES.md](09-audit-preparation.md)
- [07 #14 — Forge fmt config aligned with style guide](07-testing-strategies.md)
- [08 #5 — line_length = 80, int_types = "long"](08-code-style-conventions.md)
- [12 #7 — Custom forge fmt rules](12-tooling-development.md)
