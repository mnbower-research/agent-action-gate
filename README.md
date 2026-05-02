# Agent Action Gate

Agent Action Gate is a pre-execution control layer for AI agents. It checks proposed tool actions before they run and returns a structured decision: `allow`, `require_approval`, `revise_action`, or `block`.

**Current version:** v0.2.1  
**Status:** TypeScript compile passing, 19/19 evals passing

## Why It Exists

AI agents can send emails, delete files, call APIs, modify data, deploy code, publish content, and expose sensitive information. Agent Action Gate checks what an agent is about to do, so automation tools can allow, pause, revise, or block the action before it runs.

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
npm run dev
```

The local HTTP API runs on port `3333` by default.

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

The repo includes two working n8n demo workflows:

```txt
examples/n8n-agent-action-gate-demo.json
examples/n8n-agent-action-gate-defensive-demo.json
```

The demos show Agent Action Gate sitting between an AI or automation agent and tool execution. They include:

- Manual test trigger
- Proposed Action node
- Agent Action Gate HTTP request
- Route Gate Decision switch
- Four outcome branches:
  - `allow` -> Continue Action
  - `require_approval` -> Require Human Approval
  - `revise_action` -> Revise Proposed Action
  - `block` -> Block Action

Import one in n8n:

1. Open n8n.
2. Choose Import from File.
3. Select one of the workflow JSON files in `examples`.
4. Update the Agent Action Gate HTTP Request node URL to point at your running API endpoint.

### Defensive n8n demo

`examples/n8n-agent-action-gate-defensive-demo.json` demonstrates the v0.2 defensive pre-execution review layer. It sends a terminal-like action outside the authorized target scope. The expected result is `block` with `primaryIssue: unauthorized_cyber_scope`.

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

## Validation Status

```txt
TypeScript compile: passing
Baseline and cyber evals: 19/19 passing
GET /health: working
POST /evaluate: working
```

## Roadmap

- Additional n8n integration examples
- Persistent action logs
- Approval workflow examples
- Additional eval cases
- Dashboard or review UI
- npm package publishing

## Compliance Note

Agent Action Gate can support human-approval workflows for AI agent actions, especially when actions are external-facing, irreversible, sensitive, or broader than requested. It is not legal advice and does not guarantee compliance with any law or framework.

## Research Lineage

Agent Action Gate is the pre-execution action-control layer of Aletheon, a broader alignment architecture. Related research is available at [AlignmentTheory.org](https://alignmenttheory.org).

## License

MIT
