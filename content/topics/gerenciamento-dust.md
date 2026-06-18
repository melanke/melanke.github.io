# Defensive Arithmetic in Solidity: Underflow, Dust, and Rounding Residues That Brick Order Books and Vaults

Original titles:
- Gerenciamento de dust no contrato
- preteção contra underflow

> **Merged**: combines the original `gerenciamento-dust.md` and `protecao-underflow.md` topics — both are "values misbehaving at the edges" problems (`a - b` going below zero; `a / b` truncating to almost-zero), both bite the same waterfall/payout/match code paths, and both are best taught together with the same defensive-checks vocabulary.

## Related Lessons

### Dust (rounding residue, mid-fill, min-notional)
- [04 #6 — Exclude internal tokens from payout denominator](04-defi-accounting.md)
- [04 #8 — Pre-compute final aggregate before per-iteration checks](04-defi-accounting.md)
- [04 #19 — Enforce `minOrderSize × minTick ≥ BPS` at the factory](04-defi-accounting.md)
- [04 #20 — "No active dust" invariant: every active order ≥ minOrderSize at all entry/exit points](04-defi-accounting.md)
- [11 #21 — Mid-fill dust poison pill: defensive zero-notional revert weaponized into a FIFO brick](11-bug-patterns-from-fixes.md)

### Underflow (Solidity 0.8 still bites in waterfalls)
- [11 #18 — Underflow risk in loss waterfall](11-bug-patterns-from-fixes.md)
- [04 #3 — Vault loss waterfall (seed-first absorption)](04-defi-accounting.md)
