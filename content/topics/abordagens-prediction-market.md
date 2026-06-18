# Designing a Prediction Market: CLOB vs LMSR vs Parimutuel, Position Caps, and the Trade-offs Nobody Tells You About

Original titles:
- diferentes abordagens ao construir um prediction market
- Prediction Market: Enforce max position

> **Merged**: combines the original `abordagens-prediction-market.md` and `enforce-max-position.md` topics — max position caps are not a stand-alone safety feature, they are a design *constraint* of any prediction market that wants to bound resolution disputes and oracle manipulation profitability. They belong in the same article as the higher-level model choice (CLOB vs LMSR vs parimutuel).

## Related Lessons

### Market design
- [06 #1 — Factory + Clones with validation logic in the factory](06-architecture-patterns.md)
- [06 #3 — ERC6909 for multi-token systems](06-architecture-patterns.md)
- [04 #1 — Symmetric mint/burn with double-entry accounting](04-defi-accounting.md)
- [04 #6 — Exclude internal tokens from payout denominator](04-defi-accounting.md)
- [04 #10 — Implied odds with clamp and edge cases](04-defi-accounting.md)
- [05 #1 — State machine via dedicated modifiers per state](05-lifecycle-management.md)
- [05 #4 — Graduation gate: threshold check with factory bypass](05-lifecycle-management.md)
- [05 #14 — Immutable resolution time vs actualResolutionTime](05-lifecycle-management.md)
- [03 #10 — Outcome tokens non-transferable before graduation](03-security-patterns.md)
- [03 #20 — Exclusive state: distinguish resolved vs cancel-with-refund vs cancel-no-refund](03-security-patterns.md)

### Position caps as a design constraint
- [03 #7 — Max position cap per wallet (and on all increase paths)](03-security-patterns.md)

> **Lesson gap candidate**: a higher-level design comparison (LMSR vs CLOB vs parimutuel, multi-outcome encoding choices). The article will need to write this from first principles.
