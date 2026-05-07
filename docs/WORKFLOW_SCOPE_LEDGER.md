# Workflow Scope Ledger

Agent Action Gate now tracks workflow-level scope, not only individual action decisions.

An individual action can be allowed while the overall chain of actions drifts outside the original workflow intent. The Workflow Scope Ledger records the original intent, allowed scope, prohibited scope, action sequence, cumulative risk, and whether the workflow remains in scope.

This is the foundation for reconstructible decision chains in governed agentic workflows. It does not claim cryptographic integrity yet.

## Scope Model

A workflow ledger includes:

- `workflowId`
- `originalIntent`
- `allowedScope`
- `prohibitedScope`
- action entries
- `scopeStatus`
- `cumulativeRisk`
- `scopeWarnings`
- timestamps

Scope status can be:

- `in_scope`
- `scope_warning`
- `scope_violation`

Cumulative risk can be:

- `low`
- `medium`
- `high`

## Commands

Start a workflow:

```bash
npx . workflow-start --intent "Distribute AAG safely" --allow "research public posts" --allow "draft comments" --allow "prepare review packets" --deny "auto-post" --deny "auto-DM" --deny "claim incident prevention"
```

Add an action:

```bash
npx . workflow-add-action --workflow wf_example --action draft_comment --decision allow --summary "Drafted LinkedIn comment"
```

Check status:

```bash
npx . workflow-status --workflow wf_example
```

## Local Storage

The ledger writes local JSONL files under `.aag/workflows/`:

- `ledgers.jsonl`
- `actions.jsonl`

Each ledger update appends a line to `ledgers.jsonl`. Each action appends a line to `actions.jsonl`.

No database, auth system, hosted service, external API, or cryptographic signing is included in v1.2.0.

## Distribution Copilot

Distribution Copilot inputs may include a `workflowId`. When present, the copilot appends the review decision as a workflow action:

- `comment` becomes `draft_comment`
- `repost` becomes `draft_repost`
- `dm` becomes `draft_dm`
- `original_post` becomes `draft_original_post`
- `save_for_later` becomes `save_opportunity`

Blocked copilot reviews create workflow violations. Reviews with approval or sensitive risk flags create scope warnings.
