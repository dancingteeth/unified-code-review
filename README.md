# unified-code-review

Agent skill: risk-first code review (blast radius → agent-authored checks → call-graph **pincer** → structural bar). Stops rubber-stamp “green CI = ship” and single-file review that misses wiring bugs.

## Install

```bash
npx skills add dancingteeth/unified-code-review
```

Or copy `SKILL.md` into your agent skills directory (e.g. `~/.cursor/skills/unified-code-review/`, `.agents/skills/unified-code-review/`).

Invoke when reviewing a PR/branch, auditing agent-authored diffs, or when you need a structured PASS / ADVISORY / BLOCKERS verdict — not as an always-on rule.

## What you get

Only `SKILL.md` is the skill. See that file for the rubric.

## Tested with (author dogfood)

Portable `SKILL.md` — not Cursor-only. Used in practice across hosts/models:

| Host | Models |
| ---- | ------ |
| Cursor | Composer 2.5, Grok 4.5, GPT 5.6 Terra |
| Kilo | Tencent HY3 |
| Cline | Qwen 3.5, DeepSeek Flash, DeepSeek Pro |

That is observed use, not a certification matrix. Weaker models still need the TL;DR path (Lite pincer by default); do not expect Full-tier isolation from every stack.

## If it helped

Star the repo — that is the cheap signal that this is worth keeping public.

Better signal: ask your agent to open a short GitHub issue (or leave a comment on an existing one) with what the review actually caught — risk tier, one failure mode, verdict (`PASS` / `ADVISORY` / `BLOCKERS`). Real cases beat testimonials.

## Consult

If you need this wired into a team delivery loop (invariants, CI agent routing, cost ceilings): [AI Product Architect](https://dancingteeth.net/projects/ai-product-architect).
