# unified-code-review

Agent skill for PR / branch review that forces a fixed order: **risk → agent-authored checks → call-graph pincer → structure**. It is a sensor (`PASS` / `ADVISORY` / `BLOCKERS`), not a merge button — humans still own the merge.

## The problem

LLM reviews often fail in two predictable ways:

1. **Green CI = ship** — the agent rubber-stamps after local tests pass, including tests it weakened or gamed.
2. **Single-file blindness** — it audits one function and never opens the callee. Classic miss: callers assume `getUser` *throws* on missing users; the callee returns `null`; wrong branch / silent failure downstream.

Structure-only review (code golf / “make it cleaner”) without risk triage makes that worse.

## What it does

| Pass | Focus |
| ---- | ----- |
| **1. Risk** | Blast radius first (auth, payments, migrations ≠ copy tweaks). What could go wrong, what to read line-by-line, empirical checks. |
| **1b. Ops laws** | Only if the repo defines them (`REVIEWS.md` / task / deploy gates). Else skip. |
| **2. Agent-authored** | Intent evidence; **tests first**; treat agent output as unreviewed external code. |
| **2b / 2c. Pincer** | Trace one level deeper before BLOCKERS. Bidirectional wiring check: what callers assume vs what callees do. Default **Lite**, not Full. |
| **3. Structure** | Code judo — delete branches/layers that can disappear; presumptive blockers (no tests, assertion gaming, spaghetti, …). |

The full rubric, output template, and Full-tier pincer appendix live in [`SKILL.md`](./SKILL.md). That file is what agents load.

## Install

```bash
npx skills add dancingteeth/unified-code-review
```

Or copy `SKILL.md` into your agent skills directory (e.g. `~/.cursor/skills/unified-code-review/`, `.agents/skills/unified-code-review/`).

Use it for PR/branch audits and agent-authored diffs — **not** as an always-on rule (too large for every chat).

## Tested with (author dogfood)

| Host | Models |
| ---- | ------ |
| Cursor | Composer 2.5, Grok 4.5, GPT 5.6 Terra |
| Kilo | Tencent HY3, Ling 3.0 Flash (inclusionAI) |
| Cline | Qwen 3.5, DeepSeek Flash, DeepSeek Pro |

Observed use, not a certification matrix. Weaker models should stay on the TL;DR path (Lite pincer by default).

## Reference dogfood

Compare models on the same target **without leaking the answer key**:

1. Open **`reference/fixture/`** as the agent workspace (not the whole repo).
2. Load `unified-code-review`; paste [`reference/PROMPT.md`](./reference/PROMPT.md).
3. **You** score the run with [`reference/maintainers/EXPECTED.md`](./reference/maintainers/EXPECTED.md) and log [`reference/maintainers/SCORECARD.md`](./reference/maintainers/SCORECARD.md).

Isolation rules: [`reference/README.md`](./reference/README.md).

## If it helped

Star the repo — cheap signal that this is worth keeping public.

Better: ask your agent to open a short GitHub issue with what it caught — risk tier, one failure mode, verdict (`PASS` / `ADVISORY` / `BLOCKERS`).

Optional tip: [Ko-fi](https://ko-fi.com/dancingteeth). More agent tooling notes: [Vibing Agents](https://agents.dancingteeth.net).
