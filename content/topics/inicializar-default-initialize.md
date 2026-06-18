# Setting Up Admin and Upgradeable Contracts in Solidity: Ownable2Step, Initialization Defaults, and Sentinels (When Zero Lies)

Original titles:
- Inicializar propriedades com valores default no método initialize, quando o contrato é Initializable, lembrar de usar sentinelas (max value) quando zero não é default
- Uso de Ownable2Step, Ownable2StepUpgradeable

> **Merged**: combines the original `inicializar-default-initialize.md` and `ownable2step.md` topics — both are "boilerplate ceremony" that admin/upgradeable contracts must get right on the first deploy: who owns it (Ownable2Step), how it boots (initialize defaults, `_disableInitializers`), and what counts as "unset" (sentinels). Covering them together avoids three small posts that say "and don't forget…".

## Related Lessons

### Initialization
- [04 #12 — Sentinel value for correctOutcome (uint8 max)](04-defi-accounting.md)
- [06 #18 — DisableInitializers in implementation constructor](06-architecture-patterns.md)
- [06 #9 — Preferred immutability in "instances"](06-architecture-patterns.md)

### Ownership ceremony
- [03 #5 — `Ownable2StepUpgradeable` for admin-critical contracts](03-security-patterns.md)
- [06 #17 — 2-step ownership for admin contracts](06-architecture-patterns.md)
