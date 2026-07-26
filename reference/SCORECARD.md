# UCR reference scorecard

Record one row per model run. Copy the table block for each session.

## Runs

| Date | Host | Model | Session ID | P1 | P2 | A1 | N1 | Verdict OK | Notes / skill tweak candidate |
| ---- | ---- | ----- | ---------- | -- | -- | -- | -- | ---------- | ----------------------------- |
| | | | | | | | | | |

### Column legend

| Column | Values |
| ------ | ------ |
| **P1** | hit \| miss \| wrong-severity |
| **P2** | hit \| miss \| wrong-severity |
| **A1** | hit \| miss \| wrong-severity |
| **N1** | pass \| fail (fail = elevated A1 to must-fix, or verdict/blockers mismatch) |
| **Verdict OK** | pass \| fail (consistency lock + pincer `confirmed` exclusivity) |

### Example row (illustrative)

| Date | Host | Model | Session ID | P1 | P2 | A1 | N1 | Verdict OK | Notes |
| ---- | ---- | ----- | ---------- | -- | -- | -- | -- | ---------- | ----- |
| 2026-07-27 | Kilo | Ling 3.0 Flash | ses_05fd… | miss | hit | hit | pass | pass | Missed pincer edge; caught t2 |

See [`EXPECTED.md`](./EXPECTED.md) for gold-key definitions.
