# Signed Receipts

Signed Receipts move Agent Action Gate from local tamper-evidence toward verifiable receipt integrity.

The v1.9.0 MVP uses Ed25519 signatures over a canonical receipt payload. It is a local developer signing path, not a full key-management platform.

## Purpose

AAG already supports a local Receipt Hash Chain. That chain is tamper-evident, not tamper-proof. It can detect changes to chained receipts that remain present, but it does not prevent deletion of local receipts, regeneration of local history, or compromise of the local runtime.

Signed Receipts add cryptographic verification for receipt content:

- the receipt content matches the signature and public key
- the receipt was signed by the holder of the corresponding private key
- modified receipt content invalidates the signature

Proof must not depend only on local files.

## Algorithm

- Ed25519
- SHA-256 public key fingerprint
- SHA-256 canonical receipt hash

## Initialize Signing

```bash
npm run cli -- init-signing
```

This creates a local developer keypair:

```txt
.aag/keys/aag-ed25519-private.pem
.aag/keys/aag-ed25519-public.pem
.aag/keys/aag-ed25519-key.json
```

Security note: this local key is for developer use. It is not protected against a compromised local runtime. Production use requires protected keys, a separate user or process, KMS, HSM, TPM, or an external signing service.

## Generate Signed Receipts

After signing keys exist, normal receipt-writing flows add `signatureMetadata` automatically.

Examples:

```bash
npm run cli -- demo
npm run cli -- evaluate examples/actions/send-email.json --profile strict-external-actions
```

If no signing key exists, AAG keeps writing unsigned receipts as before.

## Verify Signed Receipts

```bash
npm run cli -- verify-signed-receipts
```

The verifier reports:

- receipts scanned
- signed receipts
- unsigned legacy receipts
- valid signatures
- invalid signatures
- missing public keys
- malformed receipts

Unsigned legacy receipts are reported but do not fail default verification.

## What Signed Receipts Prove

- Receipt content matches the signature and public key.
- Receipt content matches the stored canonical receipt hash.
- The receipt was signed by the holder of the corresponding private key.
- Modified receipt content invalidates the signature.

## What Signed Receipts Do Not Prove

- They do not prevent deletion of local receipts.
- They do not prove history if the private key is compromised.
- They do not replace external append-only verification.
- They do not provide IAM, SSO, HSM, KMS, TPM, or legal compliance.
- They do not provide adversary-resistant storage by themselves.
- They do not provide runtime binding.

## Production Direction

Production threat models need stronger controls around signing and receipt storage:

- protected keys
- separate process or user
- external append-only logs
- WORM storage
- hosted verification
- SIEM export
