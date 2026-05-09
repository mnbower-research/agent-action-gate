# v1.6.0 - Governance Gate Invariant

## Summary

This release restructures Agent Action Gate around the Governance Gate Invariant:

> No external signal becomes internal consequence without authorized discernment.

v1.6.0 defines the invariant, the six questions every real gate must answer before consequence, criteria for what is not a gate, and the Human Agency Infrastructure category framing.

## Added Docs

- `docs/GATE_INVARIANT.md`
- `docs/SIX_GATE_QUESTIONS.md`
- `docs/WHAT_IS_NOT_A_GATE.md`
- `docs/HUMAN_AGENCY_INFRASTRUCTURE.md`

## Updated Docs

- `README.md`
- `docs/CLI.md`

## Validation Status

- `npm.cmd run typecheck` passed
- `npm.cmd run eval:action-gate` passed, 19/19
- `npm.cmd run eval:high-impact` passed, 20/20
- `npm.cmd run test:logging` passed

## Scope

This release does not add cryptographic signing, IAM, hosted governance, or legal compliance guarantees.
