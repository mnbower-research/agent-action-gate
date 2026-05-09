# AAG Threat Model

## Scope

AAG evaluates proposed AI-agent tool actions before execution and returns `allow`, `require_approval`, `revise_action`, or `block`.

AAG v1.6.1 is a minimal TypeScript reference implementation of the Governance Gate Invariant. It is not a hardened enterprise enforcement boundary by itself.

## Core Assumption

AAG must sit in the execution path. If an agent or developer can bypass AAG and still access tools directly, the gate is not enforcing the invariant.

## Protects Against

AAG can help protect against:

- accidental irreversible actions
- missing approval
- wrong target
- unauthorized scope
- sensitive data exposure
- tool mismatch
- objective drift
- cyber-capable risky commands
- governance weakening attempts through MetaGate
- local receipt tampering detection through Receipt Hash Chain
- policy context loss through Policy Provenance
- approval without authority through Approval Authority Map

## Does Not Protect Against Yet

AAG v1.6.1 does not protect against:

- developers intentionally not calling the gate
- runtimes that ignore the gate decision
- agents with direct tool access outside AAG
- compromised approvers
- forged JSON context
- local receipt deletion by a privileged user
- code modification of AAG itself
- sandbox escape
- kernel-level attacks
- supply-chain compromise
- production enforcement without integration
- cryptographic signing or external notarization
- full IAM/RBAC
- SIEM integration
- legal compliance guarantees

## Tamper-Evident vs Tamper-Proof

Local receipt hash chains can detect alteration of chained local receipts. They help show whether local receipt history has been changed after receipts were written.

They are not tamper-proof against a user who can delete directories, regenerate history, or control the full local filesystem. Stronger guarantees require signed receipts, external append-only logs, WORM storage, hosted verification, or similar independent trust anchors.

## Advisory vs Enforced Deployment

In advisory mode, AAG is called and results are shown or logged, but execution can still bypass the gate. Advisory mode can improve visibility and review quality, but it does not enforce the Governance Gate Invariant by itself.

In enforced mode, tool execution is only reachable through AAG or a bound proxy that respects AAG decisions. Enforced deployment requires the runtime, workflow engine, or tool proxy to prevent direct action paths that skip the gate.

## Production Hardening Roadmap

Future hardening areas include:

- signed receipts
- signed policy profiles
- OIDC/JWT approver identity
- external append-only verification
- CI enforcement
- sandbox/tool proxy integration
- n8n enforcement templates
- default-deny failure behavior
- receipt verification in CI
- policy drift alerts
- incident reconstruction reports

## Closing

AAG v1.6.1 is a reference implementation of the gate invariant. It is designed to make the structure inspectable, testable, and runnable locally. Production enforcement requires binding the gate to the runtime so action cannot bypass discernment.
