# Approved Execution Demo

The approved execution demo is a local-only AAG example. It shows the governed loop:

```txt
propose -> evaluate -> review -> approve -> authority check -> simulated execute -> receipt -> verify
```

It does not post to LinkedIn, send email, scrape, schedule, or call external APIs.

## Run

```bash
npm run demo:approved-execution
```

The demo loads `examples/approved-execution-demo/proposed-action.json`, evaluates a LinkedIn comment-style action, and expects AAG to return `require_approval`.

It then prints a local Review Packet style summary with the proposed action, target, risk level, approval question, and exact payload preview.

Next, it loads `examples/approved-execution-demo/approved-action.json`, simulates local human approval by `local-founder`, checks approval authority, and performs only a local simulated execution.

The simulated execution record is written to:

```txt
.aag/demo-executions/approved-execution-demo.jsonl
```

Each record includes `simulated: true` and the note:

```txt
No external API call was made. This is a local simulated execution.
```

## Receipts

The demo writes an AAG receipt for the approved execution path. The receipt uses the normal receipt writer, so new receipts preserve:

- audit metadata
- policy provenance
- approval authority
- receipt hash-chain metadata

The metadata ordering remains policy provenance first, approval authority second, and hash-chain metadata last, so the receipt hash covers the policy and authority context.

## Verify

After running the demo, run:

```bash
npx . verify-receipts
npx . policy-provenance
npx . authority-map
```

`verify-receipts` checks the tamper-evident receipt chain.

`policy-provenance` checks policy context coverage and validity.

`authority-map` checks approval authority coverage and validity.

Legacy receipts may be reported as warnings by these commands, but they do not fail verification.

## Safety Boundary

This demo is intentionally local. It does not prove that a real external action is safe, authorized, posted, delivered, or accepted by any third-party system.

It only demonstrates how AAG can require approval, preserve authority context, simulate a post-approval execution locally, and write verifiable local evidence.
