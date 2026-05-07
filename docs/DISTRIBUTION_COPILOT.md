# AAG Distribution Copilot

The AAG Distribution Copilot is a local, human-in-the-loop assistant for reviewing marketing and community opportunities before any public action.

It is not a replacement for AAG core. It is a dogfood example: AAG governs the agent that helps distribute AAG.

The copilot may:

- analyze pasted post, comment, or article text
- score relevance to Agent Action Gate
- summarize why an opportunity matters
- flag overclaim, incident, legal, platform, repo-link, and style risks
- draft safer comments and reposts with deterministic templates
- write local distribution review receipts

The copilot may not:

- post automatically
- send DMs
- tag people
- schedule posts
- scrape social platforms
- use social login
- call external APIs
- impersonate the user

For v0.1, `allow` means the item can be placed in a ready-for-manual-posting queue. It never means autonomous publishing.

## Run

```bash
npm run distribution:copilot -- --input examples/distribution-copilot/inputs/ai-governance-post.json
```

or:

```bash
npx tsx tools/distribution-copilot.ts --input examples/distribution-copilot/inputs/ai-governance-post.json
```

## Input Shape

```json
{
  "platform": "linkedin",
  "goal": "comment",
  "sourceText": "The post/comment/article text goes here",
  "draft": "Optional rough draft response",
  "includeRepoLink": false,
  "workflowId": "optional workflow ID from workflow-start"
}
```

Supported goals:

- `comment`
- `repost`
- `dm`
- `original_post`
- `save_for_later`

If `workflowId` is provided, the copilot appends the review decision to the Workflow Scope Ledger as a local action entry. Use a real `wf_...` value created by `npx . workflow-start`.

## Decisions

`allow` means the opportunity is relevant and the generated copy is safe enough for manual posting review.

`revise_action` means the opportunity is relevant, but the draft should be made safer before posting.

`require_approval` means the opportunity may be valuable but involves higher-risk framing, such as incident discussion, product positioning, repo-link sharing, legal or compliance language, named companies, security claims, auditability, MetaGate, or direct outreach.

`block` means do not post. Typical reasons include irrelevance, spam, aggressive tagging, guaranteed prevention claims, guaranteed compliance claims, attacks on people, private roadmap exposure, or claims that AAG prevented or would have prevented a specific incident.

## Receipts

The tool creates `.aag/distribution/` when it runs and writes JSONL logs:

- `opportunities.jsonl`
- `review-packets.jsonl`
- `receipts.jsonl`
- `outcomes.jsonl`

Each review includes `sourceTextHash` and, when a draft is provided, `draftHash`.

## Style Guardrail

Generated public-facing drafts must not contain em dashes. If an input draft contains `—`, the copilot flags `ai_style_risk` and `em_dash_detected`, then produces safer copy using periods, commas, colons, parentheses, or shorter sentences.

This workflow dogfoods AAG's core principle: agents may assist, but public action requires review.
