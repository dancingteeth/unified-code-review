---
tags:
  - agents
  - documentation
---
# unified-code-review

Agent skill for PR / branch review that forces a fixed order: **risk → agent-authored checks → call-graph pincer → structure**. It is a sensor (`PASS` / `ADVISORY` / `BLOCKERS`), not a merge button — humans still own the merge. In agent pipelines, treat **BLOCKERS** as actionable; leave **ADVISORY** / nits for human triage.

Also packaged as an [Agent Plugin](https://agent-plugins.org/) (`plugin.json` + `skills/`).

## The problem

LLM reviews often fail in two predictable ways:

1. **Green CI = ship** — the agent rubber-stamps after local tests pass, including tests it weakened or gamed.
2. **Single-file blindness** — it audits one function and never opens the callee. Classic miss: callers assume `getUser` *throws* on missing users; the callee returns `null`; wrong branch / silent failure downstream.

Structure-only review (code golf / “make it cleaner”) without risk triage makes that worse.

## What it does

| Pass | Focus |
| ---- | ----- |
| **0. Change set** | Establish the diff first (merge-base / `gh pr diff`); record base/head; cluster related files; every in-scope path reviewed or skipped with a reason. |
| **1. Risk** | Blast radius first (auth, payments, migrations ≠ copy tweaks); **authz/IDOR** on changed handlers; failure modes; **journeys at risk**; reversibility; a hot or cannot-degrade path raises the tier; verification gap (`named-unrun` when checks are listed but not run). |
| **1b. Ops laws** | Only if the repo defines them (`REVIEWS.md` / task / deploy gates). Else skip. |
| **2. Agent-authored** | Intent evidence; **tests first**; treat agent output as unreviewed external code. |
| **2b / 2c. Pincer** | Trace one level deeper before BLOCKERS. Bidirectional wiring check: what callers assume vs what callees do. Default **Lite**, not Full. |
| **3. Structure** | Code judo — delete branches/layers that can disappear; presumptive blockers (no tests, assertion gaming, spaghetti, …). Advisory: parallel path, unearned defense, unproven removal. |

The full rubric and output template live in [`skills/unified-code-review/SKILL.md`](./skills/unified-code-review/SKILL.md) — that file is what agents load. The rare Full-tier pincer harness sits in [`FULL-PINCER.md`](./skills/unified-code-review/FULL-PINCER.md) and provenance in [`SOURCES.md`](./skills/unified-code-review/SOURCES.md), both loaded only on demand so the default run stays light.

## vs structure-only review (`/thermo-nuclear-code-quality-review`)

Structure-only rubrics (Cursor Team Kit's thermo-nuclear subagent, or an equivalent sibling skill) cover **Pass 3 only**. They miss risk triage, agent-authored discipline, and this verdict format.

| Invocation | Gets you |
| --- | --- |
| Structure subagent / skill **only** | ~Pass 3 structure; misses risk and agent checks |
| **This skill**, then a structure pass (or one agent with this skill loaded) | Full unified review |
| **Repo-provided review runner** (when the repo ships one that inlines its `REVIEWS.md`) | Full repo rubric |

Without a repo runner, load this skill plus the repo's `REVIEWS.md` if present. If no structure subagent is registered in your host, the skill runs Pass 3 in-thread rather than skipping it.

## Writing a `REVIEWS.md`

Repo overlays win on **thresholds and laws**; this skill still owns **process order**. A law the reviewer can enforce is three parts, not a vibe:

1. **Path glob** — which changed files it applies to (`src/api/**`, `**/*.tsx`).
2. **Flag** — the bad pattern, specific enough to match a line.
3. **Want** — what should be there instead.

Apply only to the pull request’s changed files, not the rest of the tree. Quote the law under any finding it produced. Overlay laws **add** to this skill’s portable defaults (`[authz]`, `[slopsquat]`, `[instruction_injection]`, plus `[parallel_path]` / `[unearned_defense]` when the overlay names a standard home or an accepted risk); they do not skip them unless the overlay states a stricter equivalent.

```markdown
### `src/api/**`
Endpoints must validate request input before using it. Flag any handler that
reads request data without validating it first; name the validation to add.

### `src/**/*.tsx`
Custom React hooks must be named with a `use` prefix and live in `src/hooks`.
Flag any hook declared elsewhere or named without the prefix.

### `**/*.py`
We are migrating from `requests` to `httpx`. Flag any **new** import of
`requests` and suggest the `httpx` equivalent.

### `src/worker/**`
Workers crash and restart; they do not degrade. Flag a new fallback or
freshness layer with no production failure cited. Feature checks go through
`FeatureFlags` — flag a local reimplementation.
```

A sentence of good intentions (“keep the API clean”) is not a law. Unstructured overlay text still counts when it is already enforceable (file-size caps, task UUIDs, deploy gates).

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

Or copy the `skills/unified-code-review/` directory into your agent skills directory (e.g. `~/.cursor/skills/unified-code-review/`, `.agents/skills/unified-code-review/`) and replace it when the repo updates. `SKILL.md` links to siblings by relative path, so keep the folder intact.

Clients that load [Agent Plugins](https://agent-plugins.org/) can use the repo root (`plugin.json` + `skills/`) as the plugin package.

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
