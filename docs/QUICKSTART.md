# Quickstart

This is the fresh-clone local path for Agent Action Gate. It does not require a global install or npm publishing.

## 1. Install dependencies

```bash
npm install
```

This installs the TypeScript, test, and CLI development dependencies used by the local repository commands.

## 2. Run typecheck

```bash
npm run typecheck
```

Expected result: TypeScript completes without compile errors.

## 3. Run action-gate evals

```bash
npm run eval:action-gate
```

Expected result: the baseline action-gate eval suite passes. These evals check that representative proposed actions route to the expected gate decisions.

## 4. Run the CLI demo

```bash
npm run cli -- demo
```

Expected result: the CLI prints several example gate decisions. Some actions are allowed, some require approval, and some are blocked or require revision depending on risk and context.

The demo may write local receipts under `.aag/receipts/`.

## 5. Evaluate an example action

```bash
npm run cli -- evaluate examples/actions/send-email.json --profile strict-external-actions
```

Expected result: AAG evaluates the proposed email action using the `strict-external-actions` profile and prints a structured decision. For risky external-facing actions, expect the result to pause for approval rather than silently execute.

The CLI writes local receipts by default. Receipts are local audit-style evidence for what AAG decided.

## 6. Verify signed receipts

```bash
npm run cli -- verify-signed-receipts
```

Expected result: signed receipts with valid Ed25519 signatures pass local signature verification.

Local legacy receipts may appear as unsigned. That does not fail signed receipt verification; unsigned legacy receipts are reported so you can distinguish older local evidence from v1.9.x signed receipts.

## What this proves

This quickstart proves the local reference path:

```txt
install -> typecheck -> eval -> demo -> evaluate action -> verify signed receipts
```

AAG v1.9.x includes a Signed Receipts MVP with local Ed25519 receipt signing and local signature verification. It is not production-grade key management, adversary-resistant storage, external append-only verification, hosted governance, or runtime binding.

See [CLI](CLI.md), [Signed Receipts](SIGNED_RECEIPTS.md), and [Production Hardening](PRODUCTION_HARDENING.md).
