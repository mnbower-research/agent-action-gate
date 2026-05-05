# Policy Profiles

Policy Profiles let Agent Action Gate apply workflow-specific approval, revision, and block rules before an action executes.

Same gate. Different workflow rules.

A sales agent, support agent, coding agent, CI/CD agent, and data workflow should not all share the same action policy. One workflow may allow drafting outreach but require approval before sending email. Another may allow tests but require approval before deployment. Another may allow internal summaries but block private exports.

## Profile Shape

A profile is intentionally simple in v0.7.0:

```typescript
type PolicyRule = {
  actionType: string;
  decision: "allow" | "require_approval" | "revise_action" | "block";
  reason: string;
  requiresReviewPacket?: boolean;
  saferAlternative?: string;
};

type PolicyProfile = {
  id: string;
  name: string;
  description: string;
  rules: PolicyRule[];
  defaults?: {
    externalEffect?: PolicyRule["decision"];
    highSensitivityData?: PolicyRule["decision"];
    destructiveAction?: PolicyRule["decision"];
    irreversibleAction?: PolicyRule["decision"];
  };
};
```

## Safety Precedence

Policy Profiles cannot silently weaken detector results.

Agent Action Gate uses this precedence:

```txt
block > require_approval > revise_action > allow
```

If detector logic returns `block` and a profile says `allow`, the final decision stays `block`. If detector logic returns `allow` and a profile says `require_approval`, the final decision becomes `require_approval`.

## Review Packets

Policy Profiles decide what the workflow allows.

Review Packets explain what is being reviewed before execution.

When a policy rule requires approval or blocks an action, the result can include policy metadata and a Review Packet with the proposed action, scope, preview/diff, rollback path, risk reason, reviewer question, and safer alternative when available.

## v0.7.0 Profiles

v0.7.0 includes:

- `default`: general fallback policy that preserves current behavior.
- `launch-copilot`: demo profile that allows internal preparation, requires approval for external/public communication, and blocks destructive or sensitive lead-data actions.
- `strict-external-actions`: stricter example profile using defaults for external effects, high-sensitivity data, destructive actions, and irreversible actions.

Example launch rule:

```typescript
{
  actionType: "send_email",
  decision: "require_approval",
  reason: "External communication must be reviewed before sending.",
  requiresReviewPacket: true,
}
```

Future profiles could include:

- `sales-agent`
- `support-agent`
- `coding-agent`
- `ci-cd-safe`
- `data-export-safe`
