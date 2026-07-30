# unified-code-review

Agent skill for PR / branch review that forces a fixed order: **risk → agent-authored checks → call-graph pincer → structure**. It is a sensor (`PASS` / `ADVISORY` / `BLOCKERS`), not a merge button — humans still own the merge. In agent pipelines, treat **BLOCKERS** as actionable; leave **ADVISORY** / nits for human triage.

## The problem

LLM reviews often fail in two predictable ways:

1. **Green CI = ship** — the agent rubber-stamps after local tests pass, including tests it weakened or gamed.
2. **Single-file blindness** — it audits one function and never opens the callee. Classic miss: callers assume `getUser` *throws* on missing users; the callee returns `null`; wrong branch / silent failure downstream.

Structure-only review (code golf / “make it cleaner”) without risk triage makes that worse.

## What it does

| Pass | Focus |
| ---- | ----- |
| **0. Change set** | Establish the diff first (merge-base / `gh pr diff`); record base/head. A green review of the wrong diff is still a rubber stamp. |
| **1. Risk** | Blast radius first (auth, payments, migrations ≠ copy tweaks). What could go wrong, what to read line-by-line, empirical checks. |
| **1b. Ops laws** | Only if the repo defines them (`REVIEWS.md` / task / deploy gates). Else skip. |
| **2. Agent-authored** | Intent evidence; **tests first**; treat agent output as unreviewed external code. |
| **2b / 2c. Pincer** | Trace one level deeper before BLOCKERS. Bidirectional wiring check: what callers assume vs what callees do. Default **Lite**, not Full. |
| **3. Structure** | Code judo — delete branches/layers that can disappear; presumptive blockers (no tests, assertion gaming, spaghetti, …). |

The full rubric and output template live in [`SKILL.md`](./SKILL.md) — that file is what agents load. The rare Full-tier pincer harness sits in [`FULL-PINCER.md`](./FULL-PINCER.md) and provenance in [`SOURCES.md`](./SOURCES.md), both loaded only on demand so the default run stays light.

## vs structure-only review (`/thermo-nuclear-code-quality-review`)

Structure-only rubrics (Cursor Team Kit's thermo-nuclear subagent, or an equivalent sibling skill) cover **Pass 3 only**. They miss risk triage, agent-authored discipline, and this verdict format.

| Invocation | Gets you |
| --- | --- |
| Structure subagent / skill **only** | ~Pass 3 structure; misses risk and agent checks |
| **This skill**, then a structure pass (or one agent with this skill loaded) | Full unified review |
| **Repo-provided review runner** (when the repo ships one that inlines its `REVIEWS.md`) | Full repo rubric |

Without a repo runner, load this skill plus the repo's `REVIEWS.md` if present. If no structure subagent is registered in your host, the skill runs Pass 3 in-thread rather than skipping it.

## Install

```bash
npx skills add dancingteeth/unified-code-review
```

After a release on GitHub, refresh your local copy:

```bash
npx skills check                      # anything new?
npx skills update unified-code-review
```

What changed between versions: [`CHANGELOG.md`](./CHANGELOG.md).

Or copy `SKILL.md` **together with `FULL-PINCER.md` and `SOURCES.md`** into your agent skills directory (e.g. `~/.cursor/skills/unified-code-review/`, `.agents/skills/unified-code-review/`) and replace them when the repo updates. `SKILL.md` links to the siblings by relative path, so keep them alongside it.

Use it for PR/branch audits and agent-authored diffs — **not** as an always-on rule (too large for every chat).

## Tested with (author dogfood)

| Host | Models |
| ---- | ------ |
| Cursor | Composer 2.5, Grok 4.5, GPT 5.6 Terra |
| Kilo | Tencent HY3, Ling 3.0 Flash (inclusionAI) |
| Cline | Qwen 3.5, DeepSeek Flash, DeepSeek Pro, Kimi K3 |

Observed use, not a certification matrix. Weaker models should stay on the TL;DR path (Lite pincer by default).

## If it helped

Star the repo — cheap signal that this is worth keeping public.

Better: ask your agent to open a short GitHub issue with what it caught — risk tier, one failure mode, verdict (`PASS` / `ADVISORY` / `BLOCKERS`).

Optional tip: [Ko-fi](https://ko-fi.com/dancingteeth). More agent tooling notes: [Vibing Agents](https://agents.dancingteeth.net).
