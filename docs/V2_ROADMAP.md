# AAG v2 Roadmap

## Current Boundary

AAG v1.8.0 is a local reference implementation, not a hardened enterprise enforcement boundary. It demonstrates the Governance Gate Invariant, the Six Gate Questions, local receipts, Policy Provenance, Approval Authority Map, Approval Quality Layer, MetaGate, Multi-Gate Registry, and Receipt Hash Chain verification.

The invariant is:

> "No external signal becomes internal consequence without authorized discernment."

Short form:

> "Action must not outrun discernment."

Current maturity framing:

```txt
v1.8.0 asks the questions and records review-process signals.
v2.0 proves the answers.
```

## The Maturity Ladder

- v1.7.0 Multi-Gate Registry
- v1.8.0 Approval Quality Layer
- v1.9.0 Signed Receipts and External Verification Design
- v2.0.0 Runtime Binding and Cryptographic Trust

## v1.7.0 Multi-Gate Registry

The Multi-Gate Registry path is many specialized gates, one invariant.

Different workflows need different policy context, review questions, authority maps, and evidence requirements. A deployment action, payroll action, email action, HR action, finance action, and cyber-capable command should not all be governed by one flat policy surface.

Example gates:

- Email Gate
- Data Export Gate
- Deployment Gate
- HR Gate
- Finance Gate
- Legal Gate
- Cyber Gate
- Marketing Gate
- MetaGate

Each gate should answer the same structural question: can this proposed action become consequence with authorized discernment?

## v1.8.0 Approval Quality Layer

The Approval Quality Layer extends the principle:

```txt
Approval must not outrun understanding.
```

Approval is not meaningful oversight if the reviewer lacks time, context, authority, or freedom to say no. AAG v1.8.0 records and evaluates review-process signals for approval-gated decisions.

Review-process signals:

- review time
- Review Packet presence
- reviewer answer
- reviewer rationale
- approval authority
- supported rejection path
- second reviewer for critical risk

The layer can help detect rubber-stamp approval patterns. It does not prove internal human understanding, eliminate automation bias, or replace HR, legal, compliance, IAM, sandboxing, or runtime enforcement.

## v1.9.0 Signed Receipts and External Verification Design

v1.9.0 should define the design path toward stronger evidence integrity. These capabilities are not implemented in v1.8.0.

Design areas:

- signed receipts
- signed policy profiles
- external append-only verification
- WORM or hosted verification adapters
- CI receipt verification
- policy drift alerts

Signed receipts are intended to move from local tamper-evidence toward verifiable receipt integrity. They do not by themselves solve deletion unless paired with external append-only verification or protected storage.

The design should preserve AAG's local reference implementation while specifying how stronger verification could be layered on for deployments that need independent evidence of what policy governed an action, who approved it, and what receipt history remained intact.

## v2.0.0 Runtime Binding and Cryptographic Trust

v2.0.0 targets a stronger runtime-bound architecture:

- mandatory proxy or sidecar
- capability tokens
- strong identity for approvers
- signed receipts
- external verification
- runtime binding so tools are reachable only through the gate under the documented deployment model

Under the documented deployment model, direct tool access should fail unless the action has passed through AAG.

This target does not mean every bypass path disappears in all environments. It means the deployment model should bind tool access to the gate so the normal execution path cannot skip authorized discernment.

## Production Hardening Requirements

Production hardening requires:

- strong identity
- runtime isolation
- sandbox or tool proxy integration
- signed policy and receipts
- external verification
- SIEM or webhook export
- incident reconstruction
- red-team evals
- formal threat model expansion

These requirements move AAG from a local inspectable reference into a stronger enforcement architecture, but they still depend on correct integration and operational controls.

## Closing

AAG v1.8.0 defines and demonstrates the gate invariant, specialized routing, and approval-quality process metadata. The v2 roadmap focuses on proving the answers and binding the gate to the runtime so consequential action cannot bypass discernment under the documented deployment model.
