# Runtime Binding MVP

Runtime binding means the execution path checks for valid AAG authorization before a tool action can become consequence.

The v2.0.0 MVP invariant is:

```txt
No tool execution without a valid AAG execution permit.
```

This layer does not replace the existing AAG evaluation logic. It sits after evaluation and receipt writing:

```txt
evaluate action -> write receipt -> issue execution permit -> protected executor verifies permit -> simulated execution
```

## Why signed receipts are not enough

Signed receipts prove that local receipt content matches a signature and public key. They help show what AAG decided.

Signed receipts alone do not force the runtime to obey that decision. An agent or tool wrapper could still execute a tool directly unless the execution path requires a separate authorization artifact.

Runtime binding adds that missing runtime check: the executor refuses to run without a valid permit for the exact proposed action.

## Execution permits

An execution permit is a short-lived local authorization object for one allowed action.

The MVP permit includes:

- `permitVersion`
- `permitId`
- `receiptId`
- `actionHash`
- `decision: "allow"`
- `issuedAt`
- `expiresAt`
- `nonce`
- `policyHash`
- `configHash`
- optional local Ed25519 `signatureMetadata` when local signing keys are available

Permits are only issued for executable `allow` decisions. AAG does not issue permits for `require_approval`, `revise_action`, or `block`.

## Protected executor checks

The protected executor demo checks:

- a permit is present
- the permit has the expected shape
- the permit has not expired
- the permit decision is `allow`
- the permit `actionHash` matches the proposed action
- required policy/config metadata exists
- the permit signature is valid when signature metadata is present

If the permit is missing or invalid, the simulated executor prints:

```txt
EXECUTION DENIED: missing valid AAG permit
```

If the permit is valid, the simulated executor prints:

```txt
EXECUTION ALLOWED: valid AAG permit
```

## Demo

Run:

```bash
npm run demo:runtime-binding
```

The demo is local and simulated. It does not send email, delete records, call external APIs, deploy code, or touch real systems.

It shows two paths:

1. Attempted execution without a permit is denied.
2. An allowed action is evaluated by AAG, a receipt is written, a short-lived permit is issued, and simulated execution proceeds after permit verification.

## Tests

Run:

```bash
npm run test:runtime-binding
```

The tests cover:

- missing permit denial
- expired permit denial
- wrong action hash denial
- valid permit simulated allow
- no permit issuance for `require_approval`, `revise_action`, or `block`

## MVP limits

This MVP is a local reference implementation. It does not provide production-grade runtime enforcement by itself.

It does not provide:

- hosted governance
- enterprise key management
- adversary-resistant local storage
- external append-only verification
- mandatory sidecar or proxy deployment
- IAM policy enforcement
- sandboxing
- network isolation
- legal compliance review

Production still requires IAM, sandboxing, least privilege, runtime separation, protected keys, external append-only receipt storage, and bypass testing.

See [Production Hardening](PRODUCTION_HARDENING.md), [Signed Receipts](SIGNED_RECEIPTS.md), and [Threat Model](THREAT_MODEL.md).
