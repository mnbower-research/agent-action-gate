# AAG v2 Roadmap

## Current Boundary

AAG v1.6.1 is a local reference implementation, not a hardened enterprise enforcement boundary. It demonstrates the Governance Gate Invariant, the Six Gate Questions, local receipts, Policy Provenance, Approval Authority Map, MetaGate, and Receipt Hash Chain verification.

The invariant is:

> "No external signal becomes internal consequence without authorized discernment."

Short form:

> "Action must not outrun discernment."

Current maturity framing:

```txt
v1.6.1 asks the questions.
v2.0 proves the answers.
```

## The Maturity Ladder

- v1.6.1 Reference Implementation
- v1.6.2 Threat Model and Enforcement Boundary
- v1.7.0 Multi-Gate Registry
- v1.8.0 Agency Preservation Layer
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

## v1.8.0 Agency Preservation Layer

The agency preservation layer extends the principle:

```txt
Score systems, not souls.
```

AAG evaluates proposed system actions, not the moral worth of people.

Potential detectors:

- `outsideAuthority`
- `irreversibleWithoutApproval`
- `oneWayVisibility`
- `humanScoringWithoutContestability`
- `decisionAuthorityRemoved`
- `auditBecomesSurveillance`
- `complianceTheater`
- `integrationBypass`

The goal is to identify workflow structures that reduce human agency, authority, contestability, or accountability before those structures become operational defaults.

## v1.9.0 Signed Receipts and External Verification Design

v1.9.0 should define the design path toward stronger evidence integrity. These capabilities are not implemented in v1.6.1.

Design areas:

- signed receipts
- signed policy profiles
- external append-only verification
- WORM or hosted verification adapters
- CI receipt verification
- policy drift alerts

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

AAG v1.6.1 defines and demonstrates the gate invariant. The v2 roadmap focuses on proving the answers and binding the gate to the runtime so consequential action cannot bypass discernment under the documented deployment model.
