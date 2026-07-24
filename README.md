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

## Consult

If you need this wired into a team delivery loop (invariants, CI agent routing, cost ceilings): [AI Product Architect](https://dancingteeth.net/projects/ai-product-architect).
