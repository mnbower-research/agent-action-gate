# Integration Guide

Agent Action Gate sits between an agent's proposed tool action and the actual execution of that tool.

Core pattern:

```txt
Agent proposes tool action
-> normalize proposed action into ActionGateInput
-> call evaluateAction or POST /evaluate
-> branch on decision
-> write/retain receipt
```

Decision handling:

- `allow`: execute if the caller is otherwise permitted to use the tool.
- `require_approval`: pause and show the Review Packet before any execution.
- `revise_action`: revise the proposed action, then retry evaluation.
- `block`: do not execute.

AAG is a pre-execution control layer. It should be placed before the side effect happens, not after a tool has already run.

## ActionGateInput

Normalize each proposed tool action into an `ActionGateInput` before evaluation. The exact fields depend on the action, but the input should preserve the user request, proposed tool/action, target, relevant payload summary, reversibility, external-facing status, and execution context.

TypeScript usage:

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
```

HTTP usage:

```txt
POST /evaluate
```

Use the HTTP API when the agent runtime and AAG run as separate processes.

## Generic tool-calling agent

For a generic tool-calling agent, wrap the tool dispatcher:

1. Receive the agent's proposed tool call.
2. Convert the tool call into `ActionGateInput`.
3. Call `evaluateAction` or `POST /evaluate`.
4. Branch on `decision`.
5. Execute only after an `allow` decision and any other required permission checks.
6. Retain the receipt or receipt path for audit review.

`require_approval` should stop the tool call and show the reviewer the Review Packet context. Approval should be explicit and should feed a new evaluation or controlled execution path.

## n8n workflow

The n8n pattern is:

```txt
Trigger
-> proposed action node
-> Agent Action Gate HTTP Request
-> decision switch
-> allow / require_approval / revise_action / block branch
```

The included demo workflows use `POST /evaluate` and branch on AAG's decision. The human approval demo keeps the default path safe by rejecting the simulated approval unless it is changed deliberately.

For n8n Cloud, run AAG behind a reachable endpoint or tunnel and update the Agent Action Gate HTTP Request node URL. The local API defaults to:

```txt
http://localhost:3333/evaluate
```

## LangGraph-style workflow

No LangGraph dependency is required for AAG. In a LangGraph-style workflow, treat AAG as a guard node before any node that can create external effects.

Conceptual graph:

```txt
plan/propose action
-> AAG guard node
-> decision router
-> allowed tool node
-> receipt/audit state
```

The guard node should normalize the pending tool action into `ActionGateInput` and store the AAG result in workflow state. The router should send `allow` to the tool node, `require_approval` to a human review node, `revise_action` back to planning, and `block` to a stop path.

Keep tool execution behind the decision router so a model-generated tool call cannot bypass the gate by calling the tool directly.

## API/tool wrapper pattern

For shared tools, place AAG inside the wrapper or adapter that all callers must use:

```txt
agent/tool caller
-> governed tool wrapper
-> AAG evaluation
-> decision branch
-> real API/tool call only if allowed
```

This is useful for email, ticketing, file mutation, deployment, database writes, publishing, and customer-data tools.

The wrapper should:

- deny direct access to the underlying credential where possible
- construct `ActionGateInput` consistently
- preserve Review Packet context for approvals
- write or retain receipts
- log blocked and revised attempts for review

For production hardening, combine this pattern with IAM, least-privilege credentials, sandboxing, runtime separation, protected signing keys, and external append-only receipt storage.

See [Quickstart](QUICKSTART.md), [CLI](CLI.md), [Threat Model](THREAT_MODEL.md), and [Production Hardening](PRODUCTION_HARDENING.md).
