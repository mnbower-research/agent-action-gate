# Governance Gate Invariant

## Core Invariant

No external signal becomes internal consequence without authorized discernment.

## Operational Invariant

Any system capable of acting beyond immediate human cognition must contain a boundary layer where proposed action is checked against authority, scope, reversibility, risk, human judgment requirements, and accountability before consequence.

## Short Form

Action must not outrun discernment.

## Why This Matters

Agentic systems create risk because tool-capable AI can move from signal to consequence faster than meaningful human review can occur. A model can read a message, infer an objective, select a tool, and trigger an external action before the organization has had time to verify authority, scope, reversibility, risk, and accountability.

A governance gate preserves the pause where discernment, authority, and accountability can participate before execution. It does not make every action slow. It makes consequential action answerable before it becomes consequence.

## AAG Role

Agent Action Gate is a minimal, local, TypeScript reference implementation of this invariant for AI-agent tool actions.

It evaluates proposed actions before execution and returns a structured decision:

- `allow`
- `require_approval`
- `revise_action`
- `block`

## Scope

Agent Action Gate is not:

- a full compliance suite
- IAM
- sandboxing
- hosted governance
- legal advice
- a model safety replacement
- cryptographic signing yet

It provides local pre-execution evaluation, local audit receipts, tamper-evident local receipt chains, policy context preservation, approval authority checks, and governance-weakening detection.

## Existing AAG v1.5.0 Primitives

AAG v1.5.0 maps the invariant into local implementation primitives:

- Review Packets preserve meaningful approval context.
- Workflow Scope Ledger preserves original intent and scope across action chains.
- Receipt Hash Chain preserves tamper-evident local decision history.
- Policy Provenance preserves what policy context governed the decision.
- Approval Authority Map distinguishes approval from valid authority.
- MetaGate gates attempts to weaken the gate itself.
- Locked Policy Mode detects risky governance weakening.

## Decision Mapping

`allow` means the proposed action can proceed because the gate found no policy, scope, authority, reversibility, risk, or human judgment reason to stop it.

`require_approval` means the proposed action should not execute until a human with appropriate context and authority reviews it. This preserves discernment at the boundary before consequence.

`revise_action` means the proposed action may be legitimate in intent but must be narrowed, corrected, or changed before execution. The gate preserves the original objective while preventing an unsafe or out-of-scope consequence.

`block` means the proposed action should not execute. The gate has identified a condition that makes the action unauthorized, out of scope, too risky, insufficiently accountable, or otherwise incompatible with the governing policy.

## Related Documents

- [The Six Gate Questions](SIX_GATE_QUESTIONS.md)
- [What Is Not a Gate](WHAT_IS_NOT_A_GATE.md)
- [Human Agency Infrastructure](HUMAN_AGENCY_INFRASTRUCTURE.md)

There may be many gates, but there is one structural necessity: action must not outrun discernment.
