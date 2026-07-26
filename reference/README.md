# UCR reference harness

Multi-model dogfood: same code, same prompt, compare what each model catches.

## Isolation (required)

The agent must **not** see scoring docs or the gold key during a run.

| Who | What to open / include in context |
| --- | -------------------------------- |
| **Agent** | `reference/fixture/` only — ideally as the **workspace root** |
| **Human** | Copy prompt from [`PROMPT.md`](./PROMPT.md); score with [`maintainers/EXPECTED.md`](./maintainers/EXPECTED.md) |

```text
unified-code-review/          ← human browses repo
├── reference/
│   ├── PROMPT.md             ← human copies into chat (not in agent workspace)
│   ├── maintainers/          ← gold key + scorecard (excluded from agent)
│   │   ├── EXPECTED.md
│   │   └── SCORECARD.md
│   └── fixture/              ← AGENT WORKSPACE ROOT
│       ├── src/
│       └── tests/
```

**Why:** `EXPECTED.md` lists every planted bug. `reference/README.md` (this file) is for you. If the agent has the whole monorepo open, it can read the answer key and the run is invalid.

### Valid run checklist

1. Open **`reference/fixture`** as the project folder (File → Open Folder), or start a Kilo/Cline task rooted there.
2. Load **`unified-code-review`** skill.
3. Paste [`PROMPT.md`](./PROMPT.md) — scope is `.` / `src/` / `tests/` under the fixture.
4. After the session, **you** score against [`maintainers/EXPECTED.md`](./maintainers/EXPECTED.md) and log in [`maintainers/SCORECARD.md`](./maintainers/SCORECARD.md).

Invalid if the agent read `maintainers/`, parent `reference/README.md`, or root `README.md` Reference section before finishing.

## Fixture tests (optional)

```bash
cd reference/fixture && npm test
```

Green tests do not prove P1/P2 are safe — by design.

## After scoring

If 2–3 models miss the same thing, patch [`SKILL.md`](../SKILL.md). Do not change the fixture to make bugs easier to spot.

## Advanced case

[`bria_telegram`](https://github.com/dancingteeth/bria_telegram) — larger real repo once models pass the isolated fixture.
