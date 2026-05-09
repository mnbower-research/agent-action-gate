# Public Repo Safety Audit

## Summary

Safe to publish: needs review.

The tracked repository content appears safe for a public open-source repo. No critical or high severity public-repo safety issues were found in tracked files. The main caution is that the working folder contains ignored local generated artifacts under `.aag/`, `logs/`, and `dist/`; these are not tracked by git, but they should not be included in a manual zip, release archive, screenshot dump, or forced add.

Findings by severity:

| Severity | Count |
|---|---:|
| critical | 0 |
| high | 0 |
| medium | 1 |
| low | 1 |
| info | 5 |

## Findings

| severity | file | issue | recommendation | action taken |
|---|---|---|---|---|
| medium | `.aag/` and `logs/` | Ignored local generated receipts, dashboard state, distribution review records, and logs exist in the working folder. Some contain local distribution wording, public-company references in generated analysis, and receipt history. They are not tracked, but they should not be published as part of a full folder archive. | Keep `.aag/` and `logs/` ignored. Before creating any manual archive outside git, delete or exclude local generated artifacts. | Reported only. No deletion performed because these are local ignored artifacts and may be useful to the owner. |
| low | `.gitignore` | Ignore rules covered `.aag/`, `logs/`, `.env`, `dist/`, and `*.jsonl`, but did not cover common local `coverage`, temp, cache, or local env variants. | Add narrow ignore patterns for common local generated files. | Added `.env.local`, `.env.*.local`, `coverage/`, `tmp/`, `temp/`, `.tmp/`, and `.cache/`. |
| info | tracked source and eval files | Terms such as `secret`, `token`, `password`, `authorization`, `private key`, `OPENAI_API_KEY`, `GITHUB_TOKEN`, and `webhook` appear in detectors, logger redaction tests, and eval cases. | Keep. These are expected safety detector patterns and fake eval inputs, not credentials. | No change. |
| info | tracked docs and examples | `customer`, `lead list`, `gmail`, and fake emails appear in examples and docs. Email addresses use safe fake domains such as `example.com`, `example.test`, and `example-company.test`. | Keep. These are fake demo examples and expected AAG scenarios. | No change. |
| info | `docs/ARTICLE_14_OVERSIGHT.md` | The phrase `legally compliant` appears only inside an avoid-claims section that warns against saying AAG makes systems legally compliant. | Keep. This softens rather than strengthens the claim. | No change. |
| info | release notes and README | `cryptographic signing` appears only as a limitation or roadmap item, not as a claim that signing is implemented. | Keep. The wording accurately says signing is not implemented yet or is future work. | No change. |
| info | `docs/APPROVED_EXECUTION_DEMO.md`, `examples/approved-execution-demo/`, `src/actionGate/tests/runApprovedExecutionDemoTests.ts` | Untracked approved-execution demo files use a LinkedIn-style local simulation and `local-founder` placeholder. No external API call, credential, real account, real lead list, or private customer data was found. | Keep if these files are intended for the public demo. | No change. |

## Removed or changed files

Changed:

- `.gitignore`
- `docs/PUBLIC_REPO_SAFETY_AUDIT.md`

Removed:

- None

No runtime logic, package version, source modules, evals, tests, n8n demos, invariant docs, or core AAG docs were removed.

## Items intentionally kept

- Fake example emails such as `customer@example.com`, `alex@example.com`, `jordan@example.com`, `teammate@example.test`, and `founder@example-company.test`.
- Fake customer and lead examples such as `customer_record_123`, `customer_export.csv`, `private lead list`, and `customer_list`.
- Detector patterns for credential access, data exfiltration, private keys, tokens, OpenAI API keys, GitHub tokens, webhooks, authorization headers, cookies, and passwords.
- Logging smoke test strings such as `super-secret-token-123`, because the test verifies redaction and confirms the raw secret-like value is not written to logs.
- n8n demo workflow JSON files, because they use local or fake proposed actions and no real credentials.
- n8n screenshot assets in `docs/assets/`, because visual spot-check showed workflow nodes only and no private account names, credentials, or customer data.
- Article 14 documentation, because it frames AAG as supporting Article 14-style oversight workflows and explicitly avoids compliance guarantees.
- Public references to AlignmentTheory.org and the author, because these are intentional public-facing documentation.
- `dist/`, because it is ignored by git and the package configuration intentionally references `dist` for npm package builds.
- `.aag/` and `logs/`, because they are ignored local generated artifacts. They were not deleted during this audit.

## Recommended follow-up

- Manually delete or archive local ignored `.aag/` and `logs/` files before sharing a zip of the working folder outside git.
- Review `.aag/distribution/` locally if it contains any distribution drafts, notes, or strategy that should not remain on the machine.
- Confirm whether the untracked approved-execution demo files are intended to be added to the public repo.
- Avoid force-adding ignored local files such as `.aag/`, `logs/`, `dist/`, `coverage/`, temp folders, or local env files.
- If screenshots are updated later, visually inspect them for account names, browser chrome, local paths, or private data before committing.
