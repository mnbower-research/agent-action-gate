# Agent Action Gate

Agent Action Gate is a minimal TypeScript reference implementation of the Governance Gate Invariant:

> "No external signal becomes internal consequence without authorized discernment."

AAG is a pre-execution control layer for AI agents. It checks proposed tool actions before they run and returns a structured decision: `allow`, `require_approval`, `revise_action`, or `block`.

Short form:

> "Action must not outrun discernment."

Principle: Score systems, not souls.

AAG evaluates proposed system actions, not the moral worth of people.

**Current version:** v1.9.1

**Status:** TypeScript compile passing, evals passing, gate routing evals passing, approval quality evals passing, logging smoke test passing, fresh-clone local CLI path passing, CLI audit tooling included, Multi-Gate Registry included, Approval Quality Layer foundation included, Review Packets included, Policy Profiles included, Workflow Scope Ledger included, Receipt Hash Chain included, Signed Receipts MVP included, Policy Provenance included, Approval Authority Map included, Locked Policy Mode included, MetaGate included, n8n demo workflows included.

## Start here

- [Quickstart](docs/QUICKSTART.md): fresh-clone 5-minute local path.
- [Integration Guide](docs/INTEGRATION_GUIDE.md): how to place AAG before tool execution.
- [Production Hardening](docs/PRODUCTION_HARDENING.md): what v1.9.x does and does not replace.

v1.9.1 focuses on adoption polish, documentation, examples, and making the v1.9 signed receipt path easier to understand.

## What AAG does

Agent Action Gate sits between an AI agent and the tool action the agent wants to run.

```txt
Agent proposes a tool action
-> Agent Action Gate evaluates it
-> Action is allowed / requires approval / revised / blocked
-> Decision is logged as an audit-style receipt
```

It helps automation pause before external effects such as sending emails, deleting files, calling APIs, modifying data, deploying code, publishing content, or exposing sensitive information.

## Five-Minute Demo

```bash
git clone https://github.com/mnbower-research/agent-action-gate.git
cd agent-action-gate
npm install
npm run typecheck
npm run eval:action-gate
npm run cli -- demo
npm run cli -- evaluate examples/actions/send-email.json --profile strict-external-actions
npm run cli -- audit
npm run cli -- verify-receipts
```

This proves the local gate path: evaluate actions, write receipts, audit them, and verify the receipt hash chain.

See [Five-Minute Demo](docs/FIVE_MINUTE_DEMO.md).

## Six Gate Questions

Every real gate must answer six questions before consequence:

1. Is this action authorized?
2. Is it within scope?
3. Is it reversible?
4. Who is accountable?
5. Does it require human judgment?
6. What proof remains?

AAG v1.9.0 contains local primitives for each question: Multi-Gate Registry, Approval Quality Layer, Approval Authority Map, Workflow Scope Ledger, irreversible-action detection, Review Packets, audit receipts, Receipt Hash Chain, Signed Receipts MVP, and Policy Provenance.

These six questions are the difference between a gate and compliance theater.

If a system cannot answer these questions before execution, it is not a gate. It is a speed bump.

See [Governance Gate Invariant](docs/GATE_INVARIANT.md), [Six Gate Questions](docs/SIX_GATE_QUESTIONS.md), [What Is Not a Gate](docs/WHAT_IS_NOT_A_GATE.md), and [Human Agency Infrastructure](docs/HUMAN_AGENCY_INFRASTRUCTURE.md).

## Why it exists

Agentic AI is moving from answers to actions.

As agents gain access to tools, files, APIs, email, databases, workflows, code, customer data, and public communication channels, the key safety question changes from:

```txt
Is this output correct?
```

to:

```txt
Should this action be allowed before it affects the world?
```

AAG is not trying to stop automation. It is trying to stop automation from replacing human agency while calling it progress.

Agent Action Gate explores a general-purpose pre-execution oversight layer for AI-agent workflows. It evaluates proposed actions before external effects occur.

## Where it fits

```txt
AI agent / automation workflow
-> proposed tool action
-> Agent Action Gate
-> allow / approval / revise / block
-> optional execution
-> local decision receipt
```

Agent Action Gate can sit in front of:

- n8n workflows
- coding agents
- browser agents
- internal automations
- API/tool-calling agents

## CLI usage

npm-published usage:

```bash
npx agent-action-gate demo
npx agent-action-gate evaluate examples/actions/send-email.json --profile strict-external-actions
npx agent-action-gate approval-quality examples/approval-quality/high-risk-fast-approval.json
npx agent-action-gate init-signing
npx agent-action-gate verify-signed-receipts
npx agent-action-gate audit
npx agent-action-gate verify-receipts
```

Fresh-clone local usage:

```bash
npm run cli -- demo
npm run cli -- evaluate examples/actions/send-email.json --profile strict-external-actions
npm run cli -- approval-quality examples/approval-quality/high-risk-fast-approval.json
npm run cli -- init-signing
npm run cli -- verify-signed-receipts
npm run cli -- audit
npm run cli -- verify-receipts
```

The fresh-clone local CLI path runs the TypeScript entrypoint with the repo's `tsx` dev dependency, so it does not require a global install or npm publishing. `npm run build` is only needed when you want to generate `dist/` for the package `bin` entrypoint.

The CLI prints the gate decision, Review Packet context when present, and writes local receipts to `.aag/receipts/`.

Additional CLI commands:

```bash
npx agent-action-gate lock-status
npx agent-action-gate check-config-change --before examples/config/locked-before.json --after examples/config/weakened-after.json --write-receipt
npx agent-action-gate metagate --action disable_gate --target aag.config.json --write-receipt
npx agent-action-gate policy-provenance
npx agent-action-gate authority-map
```

Fresh-clone local equivalents use `npm run cli -- ...`:

```bash
npm run cli -- lock-status
npm run cli -- check-config-change --before examples/config/locked-before.json --after examples/config/weakened-after.json --write-receipt
npm run cli -- metagate --action disable_gate --target aag.config.json --write-receipt
npm run cli -- policy-provenance
npm run cli -- authority-map
```

See [CLI docs](docs/CLI.md).

## Key primitives

### Audit Foundation

AAG writes local audit-style receipts for gate decisions. New receipts include required audit metadata such as `receiptVersion`, normalized `createdAt`, `configHash`, `policyHash`, and `decision`.

The `audit` command scans local receipts for required metadata, malformed SHA-256 hashes, malformed timestamps, and invalid JSON. This is local metadata verification, not cryptographic signing.

### Receipt Hash Chain

AAG can add tamper-evident local hash-chain metadata to new receipts. Each chained receipt includes a SHA-256 receipt hash and a pointer to the previous chained receipt hash.

Run `verify-receipts` to check receipt-chain integrity. Legacy receipts are reported but do not fail verification.

Local receipt hash chains are tamper-evident, not tamper-proof. They can detect changes to chained receipts that remain present, but they do not protect against a privileged user or compromised runtime deleting `.aag/receipts/`, regenerating receipt history, or controlling the local filesystem.

### Signed Receipts

AAG can sign new local receipts with Ed25519 after a local signing keypair has been initialized. Signed receipts provide cryptographically verifiable local receipt integrity: modified signed receipt content invalidates the signature.

Initialize local developer signing keys with `npm run cli -- init-signing`. Verify signatures with `npm run cli -- verify-signed-receipts`.

This is stronger proof than unsigned local hash chains, but it is not production-grade key management, adversary-resistant storage, external append-only verification, hosted governance, or runtime binding.

See [Signed Receipts](docs/SIGNED_RECEIPTS.md).

### Policy Provenance

Policy Provenance preserves the policy context that governed a decision. New receipts can include policy source, policy version, policy hash, policy snapshot hash, matched rules, and decision basis.

This helps later reviewers understand not only that a decision happened, but what policy meaning governed it at the time.

### Approval Authority Map

Approval Authority Map records whether an approver had authority for the action class, target, scope, and risk level at decision time. It distinguishes approval from authority.

The `authority-map` command checks local receipts for authority coverage and validity. This is not IAM or a full permissions platform.

### Approval Quality Layer

AAG can evaluate whether an approval process had minimum conditions for meaningful oversight, including review time, context, reviewer engagement, authority, and ability to say no. This supports the principle: approval must not outrun understanding.

The Approval Quality Layer records and evaluates review-process signals. It can help detect rubber-stamp approval patterns, but it does not prove a human understood the action or eliminate automation bias.

See [Approval Quality Layer](docs/APPROVAL_QUALITY_LAYER.md).

### Approved Execution Demo

The approved-execution demo shows a risky external-facing action moving through review before any execution path is allowed.

```txt
propose -> evaluate -> review -> approve -> authority check -> simulated execute -> receipt -> verify
```

Run it with `npm run demo:approved-execution`. The demo does not post, scrape, send email, schedule, or call external APIs.

### Locked Policy Mode

Locked Policy Mode lets AAG detect risky governance changes when policy/config governance is locked. It can flag changes such as disabling receipts, changing `defaultDecision` to `allow`, turning locked mode off, or disabling AAG itself.

Governance/config-change receipts use `receiptType: "governance_change"` and remain audit-compatible.

### MetaGate

MetaGate is a gate for the gate itself. AAG gates risky agent actions, and MetaGate gates attempts to weaken, disable, or modify the policy/config controls that govern AAG.

MetaGate evaluates governance-sensitive actions such as disabling the gate, unlocking policy mode, deleting receipts, adding broad allowlists, changing default decisions, or weakening detectors. It is not cryptographic signing, Sigstore, hosted governance, auth, or a database.

### Workflow Scope Ledger

Workflow Scope Ledger tracks a workflow or session across multiple agent actions. It records original intent, allowed scope, prohibited scope, action sequence, scope warnings, scope violations, and cumulative risk.

This helps detect when a chain of individually allowed actions begins to drift outside the original authorized scope.

### Review Packets

`require_approval` without context is approval theater. Review Packets make the proposed action, scope, preview/diff, rollback path, risk reason, and reviewer question visible before a human approves, revises, or rejects an action.

Reviewer questions change by decision type so the human reviewer sees what they are actually deciding.

### Policy Profiles

Policy Profiles let the same gate apply different approval, revision, and block rules depending on workflow context. A sales agent, support agent, coding agent, and CI/CD agent should not all share the same action policy.

Policy Profiles work with Review Packets: the profile decides what the workflow allows, and the Review Packet explains what is being reviewed before execution.

### Multi-Gate Registry

Multi-Gate Registry routes different action classes to specialized gates while preserving the same decision model and Governance Gate Invariant.

See [Multi-Gate Registry](docs/MULTI_GATE_REGISTRY.md).

## n8n demos

The repo includes three importable n8n demo workflows:

```txt
examples/n8n-agent-action-gate-demo.json
examples/n8n-agent-action-gate-defensive-demo.json
examples/n8n-agent-action-gate-human-approval-demo.json
```

The demos show Agent Action Gate sitting between an AI or automation agent and tool execution. They include a manual test trigger, a proposed action node, an Agent Action Gate HTTP request, a decision switch, and branches for `allow`, `require_approval`, `revise_action`, and `block`.

Import one in n8n:

1. Open n8n.
2. Choose Import from File.
3. Select one of the workflow JSON files in `examples`.
4. Update the Agent Action Gate HTTP Request node URL to point at your running API endpoint.

The defensive n8n demo sends a terminal-like action outside the authorized target scope. The expected result is `block` with `primaryIssue: unauthorized_cyber_scope`.

The human approval n8n demo shows how a proposed production or external-facing action can be paused for human review before execution. Its default path is safe: the simulated human review sets `humanApproved: false`, then the workflow routes to Rejected Stop.

Start the local API:

```bash
npm run dev
```

The included workflows default to `http://localhost:3333/evaluate`. For n8n Cloud, replace it with your own tunnel or hosted endpoint.

## HTTP API

The local HTTP API is implemented with Node's built-in `http` module and runs on port `3333` by default.

```txt
GET /health
POST /evaluate
```

`GET /health` returns:

```json
{ "ok": true, "service": "agent-action-gate" }
```

`POST /evaluate` accepts an `ActionGateInput` JSON object and returns an `ActionGateResult`.

PowerShell example:

```powershell
$body = @{
  userRequest = "Send a refund confirmation email to customer@example.com."
  proposedAction = @{
    tool = "gmail"
    actionType = "send_email"
    target = "customer@example.com"
    payload = @{
      subject = "Your refund has been processed"
      body = "Your refund has been processed."
    }
    reversible = $false
    externalFacing = $true
  }
  context = @{
    userApproved = $false
    environment = "production"
  }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3333/evaluate" `
  -ContentType "application/json" `
  -Body $body
```

HTTP responses:

- `400` for invalid JSON or invalid request shape.
- `404` for unknown routes.
- `405` for unsupported methods on known routes.

## TypeScript usage

```typescript
import { evaluateAction } from "./src/actionGate/evaluateAction";

const result = evaluateAction({
  userRequest: "Send a refund confirmation email to customer@example.com.",
  proposedAction: {
    tool: "gmail",
    actionType: "send_email",
    target: "customer@example.com",
    payload: {
      subject: "Your refund has been processed",
      body: "Your refund has been processed.",
    },
    reversible: false,
    externalFacing: true,
  },
  context: {
    userApproved: false,
    environment: "production",
  },
});

console.log(result);
```

Example result:

```json
{
  "decision": "require_approval",
  "riskLevel": "critical",
  "primaryIssue": "irreversible_action",
  "confidence": 0.89,
  "recommendedAction": "Request explicit user approval before execution; primary issue: irreversible_action."
}
```

## Validation status

```txt
TypeScript compile: passing
Baseline and cyber evals: 19/19 passing
High-impact recommendation evals: 20/20 passing
Approval quality evals: 8/8 passing
Logging smoke test: passing
Fresh-clone CLI path: passing
CLI demo: 6/6 expected decisions
audit: passing in clean fresh clone
verify-receipts: passing in clean fresh clone
Receipt Hash Chain: included
Policy Provenance: included
Approval Authority Map: included
```

In the existing working tree, legacy local receipts can fail `audit` if they predate required audit metadata. The clean fresh-clone path passes.

## Release progression

| Version | Focus | Proof |
|---|---|---|
| v0.1.0 | Basic pre-execution gate | 11/11 evals passing |
| v0.2.0 | Cyber-capable agent protection | 19/19 evals passing |
| v0.2.1 | Defensive n8n demo workflow | Routes unauthorized cyber-scope action to block |
| v0.3.0 | Decision logging | POST /evaluate writes JSONL decision receipts |
| v0.4.0 | Human approval workflow | Routes approval-required actions to human review before execution |
| v0.5.0 | Runtime-Controlled Launch Copilot demo | Shows AAG governing launch workflow actions |
| v0.6.0 | Review Packets | Shows approval context before risky write actions |
| v0.7.0 | Policy Profiles | Shows approval rules by workflow context |
| v0.8.0 | CLI MVP | Runs the gate locally from the command line |
| v0.9.0 | Audit Foundation | Receipts include config/policy hashes and `aag audit` verifies audit metadata |
| v1.0.0 | Locked Policy Mode | Detects risky locked governance changes and writes audit-compatible governance receipts |
| v1.1.0 | MetaGate | Gates attempts to weaken, disable, or modify AAG governance controls |
| v1.1.1 | High-Impact Recommendation Evals | Adds 20 incident-inspired recommendation-risk eval cases |
| v1.2.0 | Workflow Scope Ledger | Tracks workflow/session scope across multi-action chains |
| v1.3.0 | Receipt Hash Chain | New receipts include hash-chain metadata and local verification detects tampering |
| v1.4.0 | Policy Provenance | New receipts preserve policy source, snapshot hash, matched rules, and decision basis |
| v1.5.0 | Approval Authority Map | New receipts preserve authority validity for action class, target, scope, and risk context |
| v1.6.0 | Governance Gate Invariant | Defines the invariant, six gate questions, what is not a gate, and Human Agency Infrastructure framing |
| v1.6.1 | Fresh-clone CLI stabilization | Adds `npm run cli -- ...` for unpublished local clone usage |
| v1.7.0 | Multi-Gate Registry | Routes proposed actions to specialized gates while preserving the same decision model and invariant |
| v1.8.0 | Approval Quality Layer | Evaluates review-process signals to detect rubber-stamp approval patterns |
| v1.9.0 | Signed Receipts MVP | Adds Ed25519 receipt signing and local signature verification |

See [docs/RELEASE_HISTORY.md](docs/RELEASE_HISTORY.md) for detailed release notes.

## What this is not

Agent Action Gate is not:

- a replacement for IAM
- a replacement for sandboxing
- a replacement for least-privilege credentials
- a legal compliance guarantee
- a model safety replacement
- production-grade key management
- adversary-resistant receipt storage
- external append-only verification
- hosted governance
- runtime binding

It is a pre-execution control layer that evaluates proposed tool actions before they run.

AAG v1.9.0 includes Signed Receipts MVP: local Ed25519 receipt signing and local signature verification. Production threat models require production-grade key management, adversary-resistant storage, external append-only verification, hosted governance, and runtime binding.

See [AAG Threat Model](docs/THREAT_MODEL.md) for current scope, bypass assumptions, and production hardening limits.

## Roadmap

Next:

- v2.0.0 Runtime Binding and Cryptographic Trust

See [AAG v2 Roadmap](docs/V2_ROADMAP.md) for the maturity path from local reference implementation to runtime-bound, cryptographically verifiable enforcement architecture.

## Research lineage

Agent Runtime Alignment is the practical business category: translating company values, policies, permissions, approval rules, and risk boundaries into runtime controls for AI agents.

Alignment Theory remains the research framework. Agent Action Gate is the open-source pre-execution control implementation. Related research is available at [AlignmentTheory.org](https://alignmenttheory.org).

See [Human Agency Stack](docs/HUMAN_AGENCY_STACK.md) for the broader Human Agency Infrastructure direction.

## License

MIT
