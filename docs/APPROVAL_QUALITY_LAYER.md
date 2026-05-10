# Approval Quality Layer

Principle:

> Approval must not outrun understanding.

Human approval is not meaningful oversight if the reviewer lacks time, context, authority, or freedom to say no.

The Approval Quality Layer gives Agent Action Gate a small foundation for evaluating review-process signals around `require_approval` decisions. It records and evaluates conditions that can make approval more or less meaningful:

- enough review time
- enough context
- reviewer engagement
- approval authority
- ability to reject the action
- second review for critical risk

This is review-process metadata. It is not moral scoring of a reviewer.

Score systems, not souls.

## What It Evaluates

The layer returns:

- `status`: `sufficient`, `weak`, `insufficient`, or `unknown`
- `issues`: review-process gaps such as `review_too_fast` or `missing_review_packet`
- `score`: a 0 to 1 review-process score
- `reason`: a short explanation
- `recommendedAction`: the next process improvement
- `minimumReviewTimeMs`: the default threshold for the risk level
- `actualReviewTimeMs`: when supplied

Default minimum review times:

- low: 0 ms
- medium: 10000 ms
- high: 30000 ms
- critical: 60000 ms

These thresholds are defaults for review discipline. They are not scientific guarantees.

## Relationship To Automation Bias

Automation bias can appear when people over-trust automated recommendations or approve a suggested action without enough review. The Approval Quality Layer does not eliminate automation bias and does not prove a human understood the action.

It can help detect rubber-stamp approval patterns by recording review-process signals, such as very fast approval, missing context, missing rationale, missing authority, or no supported rejection path.

## Relationship To Review Packets

Review Packets provide the context a reviewer needs before approving, revising, or rejecting an action. The Approval Quality Layer can flag `missing_review_packet` when approval happens without that context.

Together, Review Packets answer what is being reviewed, while Approval Quality metadata records whether the review process had minimum conditions for oversight.

## Relationship To Approval Authority Map

Approval Authority Map distinguishes approval from authority. The Approval Quality Layer uses authority as a review-process condition. If the approver did not have recorded authority, the result includes `missing_approval_authority` and becomes `insufficient`.

This strengthens authority checks without replacing IAM, HR review, legal review, or compliance review.

## Relationship To Six Gate Questions

The Six Gate Questions ask whether an action is authorized, in scope, reversible, accountable, in need of human judgment, and leaving proof behind.

Approval Quality metadata adds a focused answer to the human judgment question:

Was approval supported by enough time, context, engagement, authority, and freedom to say no?

## Limits

- AAG cannot prove internal human understanding.
- This is review-process metadata, not moral scoring.
- The review score is a process score, not a human score.
- Thresholds are defaults for review discipline, not scientific guarantees.
- This does not eliminate automation bias.
- This does not guarantee meaningful oversight.
- This does not replace HR, legal, compliance, IAM, sandboxing, or runtime enforcement.

## Future Direction

- approval dashboard
- comprehension questions
- second reviewer workflows
- protected rejection path
- signed approval records

## Local Usage

```bash
npm run cli -- approval-quality examples/approval-quality/high-risk-fast-approval.json
npm run eval:approval-quality
```
