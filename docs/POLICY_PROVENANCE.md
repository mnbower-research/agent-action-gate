# Policy Provenance

Policy Provenance is the v1.4.0 local policy-context layer for Agent Action Gate receipts.

AAG asks: should this action happen?

Receipts ask: can we prove the decision happened?

Receipt Hash Chain asks: can we verify the receipt trail was not silently altered?

Policy Provenance asks: can we prove which policy context governed the decision when it happened?

## What It Is

Each new receipt can include `policyProvenance` metadata. This metadata records the policy source, policy version, policy hash, policy snapshot hash, matched rules, and decision basis that governed the action at decision time.

Policy provenance is local-first. It is embedded in the same JSON or JSONL receipt that AAG already writes.

## Why Receipts Need Policy Context

The existing `policyHash` proves that a policy-shaped object hashed to a specific value. That is useful, but future reviewers often need more than a hash. They need enough context to understand what policy profile, MetaGate rule set, or Distribution Copilot policy governed the decision.

`policyProvenance` preserves that context without replacing the existing `policyHash` field.

## Metadata Fields

`policyId` is a stable readable identifier for the policy context when one is available.

`policySource` describes where the policy came from, such as a policy profile, MetaGate policy, default policy, config policy, or Distribution Copilot policy.

`policySnapshotHash` is a SHA-256 hash of a stable canonical snapshot of the policy-relevant information used at decision time.

`matchedRules` records detectors, risk flags, profile rules, governance controls, or other policy rules that affected the decision.

`decisionBasis` records why the decision was `allow`, `require_approval`, `revise_action`, or `block`.

## Relationship To Receipt Hash Chains

Policy provenance is attached before `hashChain` metadata is computed. That means new receipt hashes include the policy provenance payload.

If a chained receipt's policy provenance is edited later, `verify-receipts` can detect the receipt payload hash mismatch.

## Legacy Receipts

Receipts written before v1.4.0 do not include `policyProvenance` metadata. They remain readable.

The `policy-provenance` command reports legacy receipts as warnings, not failures. Historical receipts are not rewritten.

## Run Verification

```bash
npx . policy-provenance
```

Installed package usage:

```bash
npx agent-action-gate policy-provenance
```

Optional flags:

```bash
npx . policy-provenance --source receipts
npx . policy-provenance --source distribution
npx . policy-provenance --source all
npx . policy-provenance --json
```

`audit`, `verify-receipts`, and `policy-provenance` are separate:

- `audit` checks required receipt metadata.
- `verify-receipts` checks hash-chain integrity.
- `policy-provenance` checks policy context coverage and validity.

## What This Does Not Claim

- Not a full policy management system.
- Not legal compliance.
- Not signed policy provenance.
- Not external notarization.
- Not approval authority mapping.
- Not multi-gate routing.
- Not a replacement for IAM, SIEM, sandboxing, least privilege, or legal review.
