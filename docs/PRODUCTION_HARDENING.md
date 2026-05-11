# Production Hardening

Agent Action Gate v1.9.x is a local/open-source reference implementation. It demonstrates pre-execution action gating, Review Packets, policy provenance, approval authority checks, local receipt hash chains, and the Signed Receipts MVP.

It does not replace:

- IAM
- sandboxing
- least-privilege credentials
- network isolation
- runtime enforcement
- protected key management
- external append-only storage
- legal compliance review

AAG v1.9.x signed receipts provide local Ed25519 receipt signing and local signature verification. They do not provide production-grade key management, adversary-resistant storage, external append-only verification, hosted governance, or runtime binding.

## Production hardening checklist

- Run AAG out-of-process from the agent.
- Enforce tool execution through an adapter.
- Protect signing keys.
- Export receipts to append-only storage.
- Use IAM and least privilege.
- Sandbox dangerous tools.
- Monitor approval quality.
- Preserve policy provenance.
- Review authority maps.
- Test bypass attempts.

## Run AAG out-of-process from the agent

For stronger separation, run AAG outside the model or agent process. The agent should propose actions; AAG should evaluate those actions before execution.

Out-of-process deployment helps reduce accidental coupling between action generation and action authorization. It is still not runtime binding by itself.

## Enforce tool execution through an adapter

Route tool execution through a governed adapter that calls AAG before the underlying tool or API is invoked.

The adapter should reject direct execution unless the action has passed the required AAG decision path. For high-risk tools, the adapter should also verify approval state, scope, authority, and local policy context.

## Protect signing keys

The v1.9.x Signed Receipts MVP uses local Ed25519 keys. For production, signing keys should be protected outside normal agent write access and managed with appropriate operational controls.

Do not treat local developer keys as enterprise key management.

## Export receipts to append-only storage

Local receipts are useful for development and review, but local storage can be deleted or rewritten by a privileged user or compromised runtime.

Production deployments should export receipts to external append-only storage or another independently controlled audit system.

## Use IAM and least privilege

AAG does not replace identity, authorization, or credential scoping. Tool credentials should remain narrowly scoped to the minimum permissions needed for the workflow.

An `allow` decision from AAG should not grant permissions the caller does not otherwise have.

## Sandbox dangerous tools

File mutation, shell execution, browser automation, deployment, database writes, and external publishing should be isolated according to their risk.

Use sandboxing and network controls so a missed or bypassed gate does not automatically become broad system access.

## Monitor approval quality

Review approval quality signals for patterns such as very short review time, missing context, absent authority, weak engagement, or inability to say no.

Approval is only meaningful when the reviewer has enough context, authority, and agency to make the decision.

## Preserve policy provenance

Keep policy source, policy version, policy hash, policy snapshot hash, matched rules, and decision basis with receipts when available.

This helps later reviewers understand what policy governed the decision at the time.

## Review authority maps

Authority maps should reflect who can approve which action classes, targets, scopes, and risk levels.

Review them regularly, especially after role changes, workflow changes, or new high-risk tools are introduced.

## Test bypass attempts

Test whether agents or workflows can execute tools without going through AAG. Include direct tool calls, alternate credentials, disabled receipt paths, weakened policy/config changes, and attempts to delete or rewrite receipts.

Production readiness requires testing the enforcement path, not only the decision function.

See [Threat Model](THREAT_MODEL.md), [Integration Guide](INTEGRATION_GUIDE.md), [Signed Receipts](SIGNED_RECEIPTS.md), and [What Is Not a Gate](WHAT_IS_NOT_A_GATE.md).
