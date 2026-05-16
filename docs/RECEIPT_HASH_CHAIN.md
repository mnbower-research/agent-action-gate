# Receipt Hash Chain

Receipt Hash Chain is the v1.3.0 local tamper-evidence layer for Agent Action Gate receipts.

AAG asks: should this action happen?

Receipts ask: can we prove the decision happened?

Receipt Hash Chain asks: can we verify the local receipt history was not silently altered?

## What It Is

Each new local receipt gets `hashChain` metadata before it is written. The metadata includes a SHA-256 hash of the canonical receipt payload and a pointer to the previous chained receipt hash.

This creates a local append-style chain. If someone edits a chained receipt after it is written, or changes the previous-hash pointer, local verification can detect the mismatch.

## Why Receipts Need Tamper Evidence

AAG receipts record decisions, policy context, config hashes, review metadata, MetaGate decisions, workflow metadata, and Distribution Copilot review output. Those records are useful only if later readers can tell whether the local trail still matches what was written.

v1.3.0 does not make receipts impossible to alter. It makes silent alteration detectable when the chain is verified.

## How The Chain Works

New receipts include metadata like:

```json
{
  "hashChain": {
    "chainId": "local_receipts",
    "chainIndex": 0,
    "previousReceiptHash": null,
    "canonicalPayloadHash": "sha256:...",
    "receiptHash": "sha256:...",
    "hashAlgorithm": "sha256",
    "createdAt": "2026-05-08T00:00:00.000Z"
  }
}
```

`canonicalPayloadHash` is the SHA-256 hash of the stable canonical receipt payload with `hashChain` removed.

`receiptHash` is the SHA-256 hash of the final hash-chain envelope: `chainId`, `chainIndex`, `previousReceiptHash`, `canonicalPayloadHash`, `hashAlgorithm`, and `createdAt`.

`previousReceiptHash` points to the most recent prior chained receipt. The first chained receipt has `previousReceiptHash: null` and `chainIndex: 0`.

## Legacy Receipts

Receipts written before v1.3.0 do not include `hashChain` metadata. They remain readable and audit-compatible.

Verification reports legacy unchained receipts as warnings, not failures. Historical receipts are not rewritten.

## Run Verification

```bash
npx . verify-receipts
```

Installed package usage:

```bash
npx agent-action-gate verify-receipts
```

Optional flags:

```bash
npx . verify-receipts --source receipts
npx . verify-receipts --source distribution
npx . verify-receipts --source all
npx . verify-receipts --json
```

## Result Meaning

A valid result means all parsed chained receipts still match their stored payload hashes, receipt hashes, and previous-hash links. Legacy receipts may still be present.

An invalid result means verification found at least one problem, such as invalid JSON, a hash mismatch, malformed hash-chain metadata, a broken previous-hash link, or a missing previous hash.

`audit` and `verify-receipts` are separate:

- `audit` checks required receipt metadata such as `receiptVersion`, `createdAt`, `configHash`, `policyHash`, and `decision`.
- `verify-receipts` checks tamper-evident receipt-chain integrity.

## What This Does Not Claim

- Not a blockchain.
- Not cryptographic signing.
- Not external notarization.
- Not proof that the original action was safe.
- Not a replacement for IAM, sandboxing, logs, SIEM, least privilege, or legal review.
- Signed receipts are implemented separately from the local receipt hash chain.
