# Mempool Race Patterns in Solidity: Front-Running Defense and Permissionless Keeper Bounties Done Right

Original titles:
- front-running protection
- Permitir diferentes usuários chamarem uma função administrativa custosa dando recompença

> **Merged**: combines the original `front-running-protection.md` and `recompensa-funcao-administrativa.md` topics — both are *mempool incentive games*. Front-running defense protects users from being raced; permissionless keeper bounties protect the protocol from inaction. The toolkit is the same: activity timestamps, post-trigger delays, capped rewards, time locks. One article covers both directions of the same race.

## Related Lessons

### Front-running defense (protect users)
- [03 #6 — Activity timestamp for anti-front-running of resolution](03-security-patterns.md)
- [05 #16 — Open time lock after first trade](05-lifecycle-management.md)

### Permissionless keepers (protect protocol liveness, without bounty wars)
- [03 #18 — Anti-griefing: delay for permissionless incentives](03-security-patterns.md)
- [11 #12 — Permissionless bounty without delay (mempool race)](11-bug-patterns-from-fixes.md)
- [11 #14 — Bounty cap without absolute max bps](11-bug-patterns-from-fixes.md)
- [05 #11 — Bounty gate with delay post-trigger](05-lifecycle-management.md)
