# Changelog

Versions match `metadata.version` in [`SKILL.md`](./SKILL.md). Update an installed copy with:

```bash
npx skills check                      # is there anything new?
npx skills update unified-code-review
```

## 1.4.1 — 2026-07-30

- **Degraded mode for partial installs:** if the tier table selects Full but `FULL-PINCER.md` is unavailable, run **Standard** and mark the Full tier unverified — same rule as truncated context: never claim coverage you did not read.
- Pass 1 now points forward to the repo overlay (repo `REVIEWS.md` risk tiers replace the generic examples), so a strict reader does not classify with defaults before learning the repo overrides them.
- README pass table gained the **Pass 0** row (establish the change set first).

## 1.4.0 — 2026-07-30

**Heads-up for updaters: the skill is now three files.** `SKILL.md` links to `FULL-PINCER.md` and `SOURCES.md` by relative path. `npx skills update` handles this for you; if you install by hand, copy all three into the same directory or the on-demand links will dangle.

**Lighter — 36.2 KB → 24.4 KB (483 → 404 lines), no rule removed.** People run this every commit rather than every tenth commit, so per-run context cost matters more than keeping one self-contained file.

- Full-tier pincer harness moved to `FULL-PINCER.md`, loaded only when the tier table selects **Full**.
- Provenance moved to `SOURCES.md` — it was already marked "not required reading for the agent."
- The structure-only tool comparison moved to `README.md`; it argues tool choice to a human, not to the agent mid-review.
- Table alignment padding stripped: 5.6 KB of whitespace, zero content.
- Four rules that were stated two or three times now have one canonical home plus pointers.

**Fixed contradictions a literal reader could act on.**

- HIGH risk now defers to the pincer tier table instead of commanding **Full** while the table said **Standard**. The table is the single source of tier criteria, and its rows are jointly exhaustive (`Standard` = MEDIUM or HIGH without wide fan-in; `Full` = HIGH **and** wide fan-in).
- §2b (agent-as-reviewer) and §2c (pincer) carry their own triggers. They were nested under "Pass 2 — Agent-authored (when applicable)" even though §2b always applies and §2c depends on wiring, so a human-authored diff could skip both.
- Document order now follows execution order. Pass 1b had been documented before Pass 1, with the tool comparison wedged between them.
- Empirical checks state when to **run** versus when to **recommend**, matching the pipeline contract. Two places had told the sensor to execute tests while the header said to emit and stop.
- Verdict tokens are declared once and used identically everywhere. Section-scoped verdicts (Task coverage, reconcile) can no longer be mistaken for the sensor verdict.

**Added.**

- **Pass 0 — establish the change set.** Merge-base diff for branch audits (a plain two-dot diff against a moved base silently pulls in unrelated mainline history), `gh pr diff` for PRs, base/head SHAs recorded in the report. Nothing had told the reviewer how to obtain its own diff.
- Lockfiles, generated output, vendored trees, and spec/task `.md` files are out of scope for findings unless they encode a code invariant the diff violates.
- Output template split into an always-emitted core block and an add-on block, replacing five per-section "optional" caveats. Empty sections are omitted rather than emitted with placeholders.
- Nits are allowed on `ADVISORY`, not only `PASS`.

**Repo hygiene.** `reference/` is ignored via `.gitignore` instead of a machine-local `.git/info/exclude`, so the fixture and maintainer notes stay out of the installed pack from every clone. A `npx skills add <owner>/<repo>` install ships only git-tracked files.

*1.3.3 was prepared but never published; its changes are included above.*

## 1.3.2 — 2026-07-27

Pipeline contract: `Advisory` and `Nits` are for humans to triage. Agent fix loops act only on `Blockers` unless the user asks otherwise, so autofix pipelines stop implementing advisories unprompted.

## 1.3.1 — 2026-07-27

Hardening for smaller / faster models: consistency lock between verdict and `Blockers`, pre-send checklist, and the live-path gate — a `[must-fix]` on a helper or validator needs at least one production call site, otherwise it is Advisory `[latent_contract]`.

## 1.3.0 — 2026-07-27

Optional fresh-context review when the same session authored the diff: dispatch a subagent or new thread with a review package (risk summary, SHAs, overlay pointers) rather than session history.

## 1.2.0 — 2026-07-26

Pass 2 gains the example-bound fix check (`[example_bound_fix]`) and the optional decision audit for MEDIUM+ agent-authored changes.

## 1.1.0 — 2026-07-25

First public release: MIT license, skill frontmatter with trigger phrases, README problem framing.
