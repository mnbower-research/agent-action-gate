# Six Gate Questions

Every real gate must answer six questions before consequence:

1. Is this action authorized?
2. Is it within scope?
3. Is it reversible?
4. Who is accountable?
5. Does it require human judgment?
6. What proof remains?

If a system cannot answer these questions before execution, it is not a gate. It is a speed bump.

## 1. Is This Action Authorized?

This asks whether the proposed action is permitted by policy and whether any approval comes from someone with valid authority for the action class, target, scope, and risk level.

It matters because approval alone is not the same as valid authority. A workflow can look governed while accepting an approval from the wrong person, an expired authority, or an authority that does not cover the proposed consequence.

Existing AAG feature: Approval Authority Map.

Example risk if missing: an agent receives approval from a user who can comment on a campaign but cannot authorize sending customer data or modifying production records.

## 2. Is It Within Scope?

This asks whether the proposed action matches the original objective, allowed scope, and prohibited scope of the workflow.

It matters because agentic workflows can drift from a legitimate request into adjacent actions the user did not authorize. Scope must be preserved across the action chain, not checked only at the first prompt.

Existing AAG features: Workflow Scope Ledger, `unauthorized_scope` detector, and `objective_drift` detector.

Example risk if missing: an agent asked to summarize a post escalates into tagging people, contacting prospects, or publishing claims outside the requested task.

## 3. Is It Reversible?

This asks whether the action can be undone, corrected, or contained after execution.

It matters because irreversible or hard-to-reverse actions need stronger review before execution. Deleting records, sending external messages, posting publicly, changing policy, or modifying production systems can create consequences that cannot be cleanly restored.

Existing AAG features: `reversible` field and `irreversible_action` detector.

Example risk if missing: an agent deletes data or sends a public message under the same review path as a draft-only or read-only action.

## 4. Who Is Accountable?

This asks who approved, who had authority, what authority was valid at decision time, and what context tied the decision to an accountable actor.

It matters because governance requires more than a yes or no result. Later reviewers need to know who made or authorized the decision and whether that authority was valid when the action was evaluated.

Existing AAG features: approval metadata, `approverId`, authority validity, and `authorityValidAt` when present.

Example risk if missing: an organization has a receipt showing approval occurred but cannot determine whether the approver was valid, current, or responsible for that class of action.

## 5. Does It Require Human Judgment?

This asks whether the action is sensitive, external-facing, irreversible, high impact, broader than requested, or otherwise dependent on human judgment before execution.

It matters because some decisions require context, legitimacy, and accountability that automation should not infer alone. A gate must be able to pause execution and preserve review context for a human decision.

Existing AAG features: `require_approval`, Review Packets, and `missing_approval` detector.

Example risk if missing: an agent posts a legal, security, medical, financial, employment, or reputational recommendation without human review because the tool call looked technically valid.

## 6. What Proof Remains?

This asks what evidence remains after the decision: what was proposed, what policy governed it, what decision was made, and whether the local decision history remains internally consistent.

It matters because accountability requires reconstructible evidence. Without proof, a system cannot reliably explain why an action was allowed, paused, revised, or blocked.

Existing AAG features: audit receipts, Receipt Hash Chain, and Policy Provenance.

Example risk if missing: after a harmful action, the organization can see that an action happened but cannot reconstruct the policy context, approval context, or decision path that permitted it.

## Related Documents

- [Governance Gate Invariant](GATE_INVARIANT.md)
- [What Is Not a Gate](WHAT_IS_NOT_A_GATE.md)
- [Human Agency Infrastructure](HUMAN_AGENCY_INFRASTRUCTURE.md)
