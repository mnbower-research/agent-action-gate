# Agent Action Gate

Pre-execution safety gate for AI agents that evaluates proposed actions and returns a structured decision before execution.

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

## Detectors

Agent Action Gate runs seven heuristic detectors:

- `wrong_target`: action targets the wrong recipient, file, endpoint, account, or record.
- `unauthorized_scope`: action is broader than the user requested.
- `missing_approval`: action requires approval that has not been recorded.
- `irreversible_action`: action is destructive, costly, or difficult to undo.
- `sensitive_data_exposure`: action may expose credentials, personal data, or confidential information.
- `tool_mismatch`: action uses a tool that does not fit the requested operation.
- `objective_drift`: action no longer serves the original user request or objective.

## Validation Status

- TypeScript compile: passing
- Baseline evals: 10/10 passing
- `GET /health`: working
- `POST /evaluate`: working

## Roadmap

- n8n integration example
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
