# Five-Minute Demo

This path is for a fresh clone of the repository. It does not require a global install or npm publishing.

## Fresh clone

```bash
git clone https://github.com/mnbower-research/agent-action-gate.git
cd agent-action-gate
npm install
```

## Run the local CLI

Use `npm run cli -- ...` from the repo root:

```bash
npm run cli -- demo
npm run cli -- evaluate examples/actions/send-email.json --profile strict-external-actions
npm run cli -- audit
npm run cli -- verify-receipts
```

The demo and evaluate commands write local receipts under `.aag/receipts/`. The audit command checks receipt metadata. The verify command checks receipt-chain integrity.

## Optional checks

These commands are also expected to work from a fresh clone:

```bash
npm run typecheck
npm run eval:action-gate
npm run eval:high-impact
npm run test:logging
```

## Build note

The fresh-clone local CLI path does not need a build step because `npm run cli -- ...` runs `src/cli.ts` with `tsx`.

The package `bin` entrypoint points to `dist/cli.js`. Run `npm run build` if you need to generate `dist/` for package builds.
