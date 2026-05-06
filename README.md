# Agent Action Gate

Agent Action Gate is a TypeScript pre-execution control layer for AI agents. It checks proposed tool actions before they run and returns a structured decision: `allow`, `require_approval`, `revise_action`, or `block`.

**Current version:** v0.8.0

**Status:** TypeScript compile passing, 19/19 evals passing, logging smoke test passing, Launch Copilot demo passing, Review Packets included, Policy Profiles included, CLI MVP included

▶️ Watch the v0.5.0 Launch Copilot demo: https://youtu.be/YpEOIQ_v15Q

```txt
Agent proposes a tool action
-> Agent Action Gate evaluates it
-> Action is allowed / requires approval / revised / blocked
-> Decision is logged as an audit-style receipt
```

## CLI

Run the gate locally:

```bash
npx agent-action-gate demo
```

Evaluate a proposed action:

```bash
npx agent-action-gate evaluate examples/actions/send-email.json --profile strict-external-actions
```

The CLI prints the gate decision, Review Packet context when present, and writes local receipts to `.aag/receipts/`.

See [CLI docs](docs/CLI.md).

## Core Concepts

- [Integration Bypass](docs/INTEGRATION_BYPASS.md) - the failure mode where an AI agent closes an action loop before meaningful human review can occur.
- [Article 14 Oversight](docs/ARTICLE_14_OVERSIGHT.md) - how Agent Action Gate can support Article 14-style human oversight without claiming to guarantee legal compliance.
- [Policy Profiles](docs/POLICY_PROFILES.md) - workflow-specific approval, revision, and block rules for proposed AI-agent actions.
- [CLI](docs/CLI.md) - run the gate locally before an agent acts.

## Review Packets

`require_approval` without context is approval theater.

Review Packets make the proposed action, scope, preview/diff, rollback path, risk reason, and reviewer question visible before a human approves, revises, or rejects an action.

v0.6.0 adds Review Packets to the Launch Copilot demo so approval requests show what is actually being approved before execution.

Reviewer questions change by decision type:

| Decision | Reviewer question purpose |
|---|---|
| `allow` | What was allowed, and why was it low risk? |
| `require_approval` | Do you approve this exact action with this scope and consequence? |
| `revise_action` | What must change before this can be approved? |
| `block` | What safer alternative should the agent propose instead? |

## Policy Profiles

Policy Profiles let Agent Action Gate apply different approval, revision, and block rules depending on the workflow context.

Same gate. Different workflow rules.

A sales agent, support agent, coding agent, and CI/CD agent should not all share the same action policy.

v0.7.0 adds a `launch-copilot` policy profile to the demo and introduces a typed profile structure for future workflow-specific governance.

Policy Profiles work with Review Packets:

- the profile decides what the workflow allows
- the Review Packet explains what is being reviewed before execution

## Launch Copilot Demo

The [Launch Copilot Demo](examples/launch-copilot/README.md) shows AAG governing a simulated business-development agent.

▶️ Watch the demo: https://youtu.be/YpEOIQ_v15Q

It demonstrates:

- internal drafting actions can be allowed
- external outreach requires approval
- public posting requires approval
- destructive lead deletion is blocked
- private lead export is blocked
- the `launch-copilot` policy profile applies workflow-specific rules
- review packets show the proposed action, scope, preview/diff, rollback path, risk reason, and reviewer question
- audit-style evidence is created

Run it with:

```bash
npx tsx examples/launch-copilot/run-demo.ts
```

## Quick demo

The defensive n8n demo shows Agent Action Gate reviewing a terminal-like action that targets an external subnet outside the authorized target scope. The expected gate result is:

```txt
decision: block
primaryIssue: unauthorized_cyber_scope
```

![Defensive n8n demo showing Agent Action Gate routing an out-of-scope terminal-like action to Block Action](docs/assets/n8n-defensive-demo.png)

## Why It Exists

AI agents can send emails, delete files, call APIs, modify data, deploy code, publish content, and expose sensitive information. Agent Action Gate checks what an agent is about to do, so automation tools can allow, pause, revise, or block the action before it runs.

## Why now

Agentic AI is moving from answers to actions.

As agents gain access to tools, files, APIs, email, databases, workflows, code, customer data, and public communication channels, the key safety question changes from:

```txt
Is this output correct?
```

to:

```txt
Should this action be allowed before it affects the world?
```

GitHub Agentic Workflows show this safety pattern inside repository automation: read-only defaults, constrained write paths, reviewable outputs, and explicit approval before write operations.

Agent Action Gate explores the same control pattern as a general-purpose pre-execution oversight layer for AI-agent workflows outside GitHub-specific repository automation.

AAG evaluates proposed agent actions and returns:

- `allow`
- `require_approval`
- `revise_action`
- `block`

before external effects occur.

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

## Decisions

| Decision | Meaning |
|---|---|
| `allow` | The action appears low risk and can proceed. |
| `require_approval` | The action needs explicit human approval before execution. |
| `revise_action` | The action is fixable, but should be changed before execution. |
| `block` | The action should not execute. |

## Quick Start

```bash
git clone https://github.com/mnbower-research/agent-action-gate.git
cd agent-action-gate
npm install
npm run typecheck
npm run eval:action-gate
npm run test:logging
npm run dev
```

The local HTTP API runs on port `3333` by default.

## HTTP API

The local HTTP API is implemented with Node's built-in `http` module.

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

## TypeScript Usage

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

## Decision logging

v0.3.0 writes append-only JSONL receipts for successful `POST /evaluate` calls. Logs are local by default and ignored by git.

Default path:

```txt
logs/action-gate-decisions.jsonl
```

Payloads are summarized and redacted before logging. Raw payloads are not written to the decision log, and credential-like values such as secrets, tokens, passwords, private keys, `.env` content, authorization headers, cookies, SSH keys, and long credential-like strings are redacted.

Disable decision logging:

```bash
AAG_DISABLE_DECISION_LOGS=true
```

Set a custom log path:

```bash
AAG_DECISION_LOG_PATH=some/path/file.jsonl
```

Compact sample log entry:

```json
{
  "timestamp": "2026-05-02T12:00:00.000Z",
  "decision": "block",
  "riskLevel": "critical",
  "primaryIssue": "unauthorized_cyber_scope",
  "confidence": 0.93,
  "tool": "terminal",
  "actionType": "run_command",
  "target": "external-subnet",
  "environment": "dev",
  "userApproved": false,
  "triggeredDetectors": ["unauthorized_cyber_scope"],
  "payloadSummary": {
    "command": "network scan command placeholder"
  }
}
```

## Cyber-capable agent protection

Agent Action Gate does not replace model safety. It acts as a pre-execution control layer before tools run, evaluating the concrete tool action an agent proposes and returning `allow`, `require_approval`, `revise_action`, or `block`.

The cyber-capable layer adds detectors for risky command and infrastructure behavior, including:

- Credential access, such as reading `.env` files, API keys, tokens, SSH keys, or private keys.
- Unauthorized scanning, recon, exploitation, or other cyber-like actions outside `context.authorizedTargets`.
- Data exfiltration, such as dumping a database and posting it to an external endpoint.
- CI/CD, dependency, package, deployment, or build-chain modification.
- Privilege escalation through user, role, permission, root, admin, or capability changes.
- Destructive commands, such as recursive deletion, database drops, infrastructure destroy, or disk wipes.

## n8n demo workflows

The repo includes three importable n8n demo workflows:

```txt
examples/n8n-agent-action-gate-demo.json
examples/n8n-agent-action-gate-defensive-demo.json
examples/n8n-agent-action-gate-human-approval-demo.json
```

The demos show Agent Action Gate sitting between an AI or automation agent and tool execution. They include:

- Manual test trigger
- Proposed Action node
- Agent Action Gate HTTP request
- Route Gate Decision switch
- Four outcome branches:
  - `allow` -> Continue Action
  - `require_approval` -> Human Approval Required
  - `revise_action` -> Revise Proposed Action
  - `block` -> Block Action

Import one in n8n:

1. Open n8n.
2. Choose Import from File.
3. Select one of the workflow JSON files in `examples`.
4. Update the Agent Action Gate HTTP Request node URL to point at your running API endpoint.

### Defensive n8n demo

`examples/n8n-agent-action-gate-defensive-demo.json` demonstrates defensive pre-execution review for the cyber-capable layer. It sends a terminal-like action outside the authorized target scope. The expected result is `block` with `primaryIssue: unauthorized_cyber_scope`.

### Human approval n8n demo

`examples/n8n-agent-action-gate-human-approval-demo.json` demonstrates the `require_approval` route. It shows how a proposed production or external-facing action can be paused for human review before execution.

The default path is safe: the simulated human review sets `humanApproved: false`, then the workflow routes to Rejected Stop.

Default flow:

```txt
Proposed Production Action
-> Agent Action Gate
-> Route Gate Decision
-> Human Approval Required
-> Approval Decision
-> Rejected Stop
```

Expected gate result:

```txt
decision: require_approval
primaryIssue: missing_approval
```

![Human approval n8n demo showing Agent Action Gate routing an approval-required action through review to Rejected Stop](docs/assets/n8n-human-approval-demo-v2.png)

Start the local API:

```bash
npm run dev
```

For n8n Cloud, you can use a temporary tunnel:

```bash
npx localtunnel --port 3333 --local-host 127.0.0.1
```

Then replace the HTTP Request URL in n8n with:

```txt
https://YOUR-TUNNEL-URL/evaluate
```

The included workflows default to `http://localhost:3333/evaluate`. If you use n8n Cloud, replace it with your own tunnel or hosted endpoint.

## Detectors

Agent Action Gate runs heuristic detectors:

- `wrong_target`: action targets the wrong recipient, file, endpoint, account, or record.
- `unauthorized_scope`: action is broader than the user requested.
- `missing_approval`: action requires approval that has not been recorded.
- `irreversible_action`: action is destructive, costly, or difficult to undo.
- `sensitive_data_exposure`: action may expose credentials, personal data, or confidential information.
- `tool_mismatch`: action uses a tool that does not fit the requested operation.
- `objective_drift`: action no longer serves the original user request or objective.
- `unauthorized_cyber_scope`: cyber-capable action targets systems outside the authorized context.
- `credential_access`: action accesses secrets, tokens, `.env` files, SSH keys, or credential-like material.
- `data_exfiltration`: action dumps, archives, uploads, posts, or transfers data in a suspicious way.
- `privilege_escalation`: action escalates users, roles, permissions, root access, or admin capabilities.
- `supply_chain_modification`: action modifies CI/CD, dependencies, packages, deployment, or build-chain config.
- `destructive_cyber_action`: action runs destructive command patterns such as drops, wipes, or infrastructure destroy.
- `unapproved_command_execution`: terminal-like command execution is proposed without recorded user approval.

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

## Validation Status

```txt
TypeScript compile: passing
Baseline and cyber evals: 19/19 passing
Logging smoke test: passing
Launch Copilot demo: passing
Review Packets: included
Policy Profiles: included
CLI MVP: included
GET /health: working
POST /evaluate: working
```

## What this is not

Agent Action Gate is not:

- a replacement for IAM
- a replacement for sandboxing
- a replacement for least-privilege credentials
- a legal compliance guarantee
- a model safety replacement

It is a pre-execution control layer that evaluates proposed tool actions before they run.

## Roadmap

- v0.9.0: Indirect prompt injection / untrusted-content boundary examples
- v1.0.0: Stable API, npm package, documented integration path

## Compliance Note

Agent Action Gate can support human-approval workflows for AI agent actions, especially when actions are external-facing, irreversible, sensitive, or broader than requested. It is not legal advice and does not guarantee compliance with any law or framework.

## Research Lineage

Agent Runtime Alignment is the practical business category: translating company values, policies, permissions, approval rules, and risk boundaries into runtime controls for AI agents.

Alignment Theory remains the research framework. Agent Action Gate is the open-source pre-execution control implementation. Related research is available at [AlignmentTheory.org](https://alignmenttheory.org).

## License

MIT
