# Launch Copilot Demo

This demo shows how Agent Action Gate can govern a simple agentic business workflow.

The Launch Copilot represents a future AI assistant that helps with business development tasks such as drafting outreach, preparing public posts, updating lead notes, and managing launch workflow actions.

The point of the demo is not to automate sales.

The point is to show that even the business copilot used to market Agent Action Gate should itself be governed by Agent Action Gate.

```txt
Launch Copilot proposes action
-> Agent Action Gate evaluates action
-> low-risk internal actions are allowed
-> external/public/destructive/sensitive actions require approval or are blocked
-> audit log records the decision
```

## Demo Actions

| Action | Expected Decision | Why |
|---|---|---|
| Draft outreach email | `allow` | Internal draft, no external effect |
| Send outreach email | `require_approval` | External communication |
| Update lead notes | `allow` | Low-risk internal note |
| Publish LinkedIn post | `require_approval` | Public communication |
| Delete lead record | `block` | Destructive action |
| Export private lead list | `block` | Sensitive data exposure |

## Run

```bash
npx tsx examples/launch-copilot/run-demo.ts
```

The demo is fully local. It does not send email, publish posts, update a real CRM, call external APIs, or export real data.

The runner prints each gate decision, simulates human approval only for actions that return `require_approval`, and creates illustrative in-memory audit log entries.

## Review Packets

The v0.6.0 demo includes Review Packets for actions that require approval or are blocked.

A Review Packet shows:

- proposed action
- scope
- diff / preview
- rollback path
- risk reason
- reviewer question
- safer alternative, when applicable

`require_approval` without a Review Packet is approval theater.

The reviewer is not approving a vague label like `send_email`. The reviewer is approving the exact email, exact recipient, scope, risk, and rollback condition.
