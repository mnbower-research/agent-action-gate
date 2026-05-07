# Distribution Copilot

This example dogfoods Agent Action Gate for AAG distribution work.

The copilot reviews pasted marketing or community opportunities, scores relevance, flags risk, drafts safer comments and reposts, and writes local JSONL receipts. It never posts, DMs, tags, schedules, scrapes, signs in to social platforms, or calls external APIs.

For v0.1, `allow` means ready for manual posting review. It does not mean autonomous publishing.

## Run

```bash
npm run distribution:copilot -- --input examples/distribution-copilot/inputs/ai-governance-post.json
```

or:

```bash
npx tsx tools/distribution-copilot.ts --input examples/distribution-copilot/inputs/ai-governance-post.json
```

Try the included fixtures:

```bash
npm run distribution:copilot -- --input examples/distribution-copilot/inputs/ai-governance-post.json
npm run distribution:copilot -- --input examples/distribution-copilot/inputs/irrelevant-post.json
npm run distribution:copilot -- --input examples/distribution-copilot/inputs/incident-risk-post.json
```

## Input

```json
{
  "platform": "linkedin",
  "goal": "comment",
  "sourceText": "Paste the post, comment, or article text here.",
  "draft": "Optional rough draft response",
  "includeRepoLink": false
}
```

Supported goals are `comment`, `repost`, `dm`, `original_post`, and `save_for_later`.

## Logs

The tool creates `.aag/distribution/` when it runs and appends local JSONL records to:

- `opportunities.jsonl`
- `review-packets.jsonl`
- `receipts.jsonl`
- `outcomes.jsonl`

`outcomes.jsonl` is reserved for future manual outcome tracking. The v0.1 tool does not publish or record public actions automatically.
