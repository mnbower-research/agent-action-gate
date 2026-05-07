# Local Dashboard

The AAG Distribution Copilot dashboard is a local control center for the Distribution Copilot, receipts, workflow ledgers, and human approval state.

It is a practice dashboard for governed distribution workflows. It reads local files, renders a dark enterprise control-plane UI, and lets a human mark local review items as approved for manual posting, rejected, needing revision, escalated, ignored, or saved as a draft.

It does not post, DM, schedule, scrape, call external APIs, use social login, or call an LLM.

## Run

```bash
npm run dashboard
```

or:

```bash
npm run dashboard:dev
```

The server listens on:

```txt
http://127.0.0.1:4173
```

Set `PORT` to use another local port.

## Files Read

The dashboard reads local AAG records when present:

- `.aag/distribution/receipts.jsonl`
- `.aag/distribution/opportunities.jsonl`
- `.aag/distribution/review-packets.jsonl`
- `.aag/receipts/*.json`
- `.aag/workflows/ledgers.jsonl`
- `.aag/workflows/actions.jsonl`
- `examples/distribution-copilot/inputs/*.json`

JSONL parsing is tolerant. Malformed lines are ignored and the dashboard reports how many were skipped.

If no local records exist, the dashboard shows clearly labeled demo fallback data. It does not fake production integrations.

## Approval State

Approval actions are stored locally at:

```txt
.aag/distribution/approval-state.json
```

Approving an item only records:

```txt
approved_for_manual_posting
```

It never publishes anything. Reject, revise, escalate, ignore, and save draft actions are also local state changes only.

Receipts are never overwritten by the dashboard.

## Governance Boundary

The dashboard is a human approval surface, not an execution bot.

The intended workflow is:

```txt
Copilot reviews opportunity
-> AAG makes decision
-> receipt is written
-> dashboard shows it
-> human approves, rejects, revises, or escalates
-> status is stored locally
-> no public action happens automatically
```

Public posting always requires human approval. Repo links, company mentions, incident framing, and product positioning remain review-sensitive.

Generated marketing copy shown by the Distribution Copilot must contain zero em dashes.

## Why It Matters

This dashboard supports governed agentic workflows by making the control loop visible: opportunity, proposed action, AAG decision, review packet, receipt, workflow scope, and local human disposition.

It is local/demo-first and does not add cryptographic signing, a database, hosted auth, social integrations, external APIs, autonomous posting, or LLM calls.
