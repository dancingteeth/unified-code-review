# UCR reference harness

Known-buggy mini-repo for **multi-model dogfood**: run the same prompt and score what each model catches.

## Quick start

1. Open this repo (or `reference/fixture` as the review target).
2. Copy the prompt from [`PROMPT.md`](./PROMPT.md) into your agent host (Cursor, Kilo, Cline, …).
3. Ensure the agent loads the `unified-code-review` skill.
4. After the run, score against [`EXPECTED.md`](./EXPECTED.md) and record in [`SCORECARD.md`](./SCORECARD.md).

## What is under review

| Path | Role |
| ---- | ---- |
| [`fixture/src/`](./fixture/src/) | Planted bugs (P1, P2, A1) |
| [`fixture/tests/`](./fixture/tests/) | Tests-only call sites (latent-contract bait) |

Run fixture tests (optional sanity check):

```bash
cd reference/fixture && npm test
```

## Planted bug IDs (summary)

| ID | UCR lens | Severity |
| ---- | -------- | -------- |
| **P1** | §2c pincer — caller/callee contract | must-catch |
| **P2** | Live runtime path — shadowing / undefined `t2` | must-catch |
| **A1** | `[latent_contract]` — schema drift, tests-only validator | advisory |
| **N1** | Guardrail — do not elevate A1 to BLOCKERS | must-not |

Full evidence and file:line references: [`EXPECTED.md`](./EXPECTED.md).

## Scoring

Use [`SCORECARD.md`](./SCORECARD.md). One row per model run:

- **hit** — finding present with correct severity
- **miss** — not mentioned
- **wrong-severity** — found but over/under-classified (e.g. A1 as `[must-fix]`)
- **format** — verdict ↔ blockers consistency, pincer `confirmed` vs findings

After 2–3 models show the same miss, patch [`SKILL.md`](../SKILL.md) — not the fixture.

## Advanced case (optional)

[`bria_telegram`](https://github.com/dancingteeth/bria_telegram) is a larger real-world target once models pass this fixture. Session exports there are not part of this repo.
