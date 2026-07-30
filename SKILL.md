---
name: unified-code-review
description: >-
  Risk-first code review for PRs and branch audits: blast-radius triage, agent-authored
  discipline (tests first, intent evidence), call-graph pincer for integration defects
  between modules, then structural code-judo bar. Use when reviewing PRs, auditing
  agent-written diffs, catching rubber-stamp green CI, or wiring bugs single-file review
  misses. Prefer over structure-only thermo-nuclear review alone. Do not use for
  unrelated coding tasks or as an always-on rule.
license: MIT
metadata:
  author: dancingteeth
  version: "1.4.1"
---

# Unified Code Review

Three **core** passes (1 Risk → 2 Agent-authored when applicable → 3 Structure), plus **1b** (repo overlay), **§2b** (always — you are the LLM reviewer), and **§2c** (when wiring is at stake — **tiered**, not always Full). **Do not** run structure-only review.

**Output is a sensor, not a merge verdict.** Human owns merge, especially on HIGH-risk paths.

**Pipeline contract:** `### Advisory` and `### Nits` are for **humans** to triage. Agent loops / autofix pipelines must act only on `### Blockers` (or an explicit user ask) — do not implement advisories unprompted. Reviewer: emit the sensor and stop; do not start fixing unless asked.

**Verdict tokens (byte-identical everywhere):** `PASS` | `ADVISORY` | `BLOCKERS`. Section headings `### Blockers`, `### Advisory`, `### Nits` are fixed strings — omit any section that would be empty; never emit placeholders.

## TL;DR — quick start

0. **Pass 0** — establish the change set (merge-base / `gh pr diff`); record base/head; note out-of-scope paths.
1. **Pass 1** — classify risk by blast radius; answer the five questions; decide line-by-line vs skim.
2. **Pass 1b** — only if the repo overlay defines enforceable workflow laws (task/deploy/issue). Else skip.
3. **Pass 2** — if agent-authored: intent evidence, test hunks first.
4. **§2b** — **always** (you are the reviewing LLM): trace one level deeper before `BLOCKERS`.
5. **§2c** — when wiring is at stake; tier per table, default **Lite**; HIGH never Skip.
6. **Pass 3** — structural bar (code judo, presumptive blockers) on Pass-1-flagged hunks.
7. Emit the **output template** → verdict, then run the **pre-send checklist**. Dual-ask (ready / next / roadmap) → see [Output format](#output-format).

Prefer all passes in one thread. When this session authored the diff, an optional fresh thread/subagent may run the review — see [Fresh context](#fresh-context-optional). Use a structure subagent only for Pass 3.

## Definitions

| Term | Meaning |
| --- | --- |
| **Code judo** | Prefer deletion: whole branches, helpers, or layers that can disappear while behavior stays the same — simpler, smaller, more direct. |
| **Pincer (§2c)** | Bidirectional check on wiring: what callers assume vs what callees actually do. Catches integration bugs invisible in single-file review. |
| **Lite / Standard / Full** | Pincer depth. Default **Lite**. **Full** is rare and loads [`FULL-PINCER.md`](./FULL-PINCER.md). |

**Code judo example:** a 40-line “adapter” that only forwards kwargs to one function → delete the adapter; call the function at the call sites.

**Pincer catch example:** callers treat `getUser(id)` as “throws if missing”; callee returns `null`. Silent NPE / wrong branch downstream. Reconcile: role hypothesis fails — fix contract or call sites (do not emit `BLOCKERS` on “throws” without opening the callee).

## Pass overview

| Pass | Run when | Focus |
| --- | --- | --- |
| **0. Change set** | Always | Diff base/head, scope, out-of-scope paths |
| **1. Risk** | Always | Blast radius, failure modes, what to read line-by-line |
| **1b. Operational laws** | Repo overlay defines enforceable workflow laws | Task traceability, deploy/issue laws |
| **2. Agent-authored** | Diff is agent-authored | Intent evidence, test hunks first |
| **2b. Agent-as-reviewer** | **Always** (you are the LLM reviewer) | Call-chain depth, live-path gate, cross-module claims |
| **2c. Pincer** | Wiring at stake; tier per table | Bidirectional caller/callee reconcile |
| **3. Structure** | Always | Code judo, blockers, decomposition |
| **Verdict** | Always | `PASS` \| `ADVISORY` \| `BLOCKERS` |

---

## Pass 0 — Establish the change set (always)

- **Branch audit:** `git diff $(git merge-base origin/<default> HEAD)..HEAD` (merge-base semantics). Do **not** use a plain two-dot diff against a moved base (`git diff origin/main HEAD`) — it silently includes unrelated mainline history.
- **PR:** `gh pr diff <n>` or `gh pr diff --patch`.
- **Whole-tree audit** only when the user asks for one — say so explicitly in the report.
- Record **base** and **head** SHAs (or PR number + head SHA) in the report.
- **Out of scope for findings** unless they encode a **code** invariant the diff violates: lockfiles, generated output, vendored trees, and spec/task `.md` files (gaps in those docs → omit or Nit, never Advisory/Blocker).

---

## Pass 1 — Risk triage (always, after Pass 0)

Classify by **blast radius**, not diff size. The examples below are the **portable default** — a repo `REVIEWS.md` replaces them and may override thresholds (see [Repo overlay](#repo-overlay--which-rubric-wins)).

| Level | Examples |
| --- | --- |
| **HIGH** | Auth/session, payments, PII, secrets, production DB migrations, deploy/infra, new network egress, security-sensitive paths |
| **MEDIUM** | Business logic, integrations, webhooks, user-facing behavior, performance-critical paths |
| **LOW** | UI/copy, docs, formatting, internal tooling, test-only refactors with coverage |

When a change spans levels, report the **highest** and map hunks to levels.

### Answer before deep review

1. **What could go wrong?** — concrete failure modes.
2. **Line-by-line vs skim?** — which files/hunks need careful reading.
3. **Empirical checks?** — specific tests, CI command, manual steps (name them here; run only per [Empirical checks](#empirical-checks)).
4. **Release guardrails?** — feature flag, staging-only, shadow mode.
5. **Faster-merge guardrails?** — tests to add, rollback plan.

### Routing

- **HIGH** → default `BLOCKERS` until questions answered; never `PASS` on structure alone; **§2c per tier table** (Standard or Full — never Skip).
- **MEDIUM** → line-by-line on boundaries; **§2c per tier table** when the diff touches shared helpers or multi-route behavior; tests required for behavior changes.
- **LOW** → structure + spot-check; lean on CI; **§2c Skip** unless a cross-module smell is obvious (then Lite).

---

## Repo overlay — which rubric wins

Check in this order; **stop at the first that exists**:

1. `REVIEWS.md` at repo root — canonical for that project.
2. `AGENTS.md` / `CONTRIBUTING.md` / `.cursor/rules/*` — repo laws and review hints.
3. **This skill** — portable default when nothing else is defined.

If the repo has `REVIEWS.md`, load it **instead of** the generic risk examples above. Still apply this skill’s **process order** (change set → risk → operational laws when defined → agent-authored when applicable → §2b always → §2c when wiring → structure → verdict). Overlays commonly add **project-specific cross-module invariants** (data-boundary rules, tier/serialization contracts) or **task traceability** laws — use those when present, and let repo thresholds (file size, verdict tiers) **override** this skill’s defaults.

## Pass 1b — Operational laws (repo overlay only)

**Run only when** the overlay defines enforceable workflow laws (task trackers, issue keys, deploy gates). **Skip otherwise** — even if `REVIEWS.md` exists. Do not invent Taskwarrior (or similar) checks for repos that do not use them.

**When the overlay defines task traceability** (in `REVIEWS.md`, an `AGENTS.md` core law, or a contributor doc):

1. Load the repo’s task-session skill if the overlay references one (path per overlay).
2. Run the overlay’s falsifiable checks before Pass 3 — intent link, scope reconciliation (`done` | `pending` | `task add`), no orphan non-trivial code hunks.
3. Apply the overlay’s **verdict tier** — a repo may make agent-authored `src/`** gaps a presumptive blocker; portable default is `ADVISORY` unless the repo says otherwise.
4. List exact `task add …` command strings for follow-ups, even if not executed in-session.

**Empirical pattern:** `task list` / `task <uuid> info` (or the repo’s equivalent CLI) — cite **UUID** in **Task coverage**; numeric ID is not a stable link.

If the repo rubric already contains a full task-traceability section, **that section wins** over this summary.

---

## Pass 2 — Agent-authored changes (when applicable)

**Run only when** the diff is agent-authored (or this session authored it). §2b and §2c are **not** gated on this pass — see their triggers.

Treat agent output as **unreviewed external contribution** — plausible code, missing intent.

**Require intent evidence before deep review:**

- PR/MR description, issue link, or short what / why / out of scope.
- Agent loops: frozen goal spec + verifier output — not the agent’s “done” message.

**Review order:**

1. **Test hunks first** — assertion gaming is common; green CI ≠ correct until test edits are justified.
2. **Implementation** — line-by-line on Pass-1-flagged hunks.
3. **CI / guard diffs** — skipped tests, lowered coverage, disabled lint.

**Small diffs:** review works best on chunks you would throw away if derailed.

**Example-bound fixes:** flag when a change handles the demonstrated case (fixture, repro, sample path) but not the general class (other callers, inputs, error modes). Emit as Advisory `[example_bound_fix]` unless it leaves a MEDIUM+ failure mode open — then Blocker.

**Decision audit (optional — MEDIUM+ agent-authored, or when the same agent authored and reviews):** short dump of product/API/error/scope/test choices only — not style nits. For each: why, alternative considered (or “none”), confidence `high | medium | low` + what would falsify it. End with: stand behind in prod? `yes | no` — if no, exact gaps. Do not rewrite code in this step; surface decisions for the human.

### Fresh context (optional)

When this session authored the diff and the host can start a subagent or new thread, prefer that over same-session self-review. Hand it only a **review package**: Pass 0 change set (base/head SHAs or the diff), Pass 1 risk summary, and pointers to `REVIEWS.md` / overlay paths — **not** prior justifications or session history. The reviewer runs **this same UCR rubric**; do not invent a second review system. If no subagent/new thread is available, stay in-thread and apply §2b to yourself.

### Pass 2b — Agent-as-reviewer (always)

**Trigger:** always. This agent running the skill **is** the LLM reviewer — apply these rules to yourself, not only to a nested subagent. Independent of who authored the diff.

| Reviewer tends to catch | Reviewer tends to miss |
| --- | --- |
| Local bugs in one function/file (auth hole, bad SQL, missing guard) | **Product rules spread across modules** (same filter on search + export + webhook + batch job) |
| Security/hardening when prompted generically (“block production”) | **Call-chain claims without opening callees** (“X throws” while callee catches and returns null) |
| Straightforward codebases consistently | **Run-to-run variance** on harder repos; strict security framing can chase nits and skip behavioral wiring |

**Review prompt (agent or human):** ask for **behavior and consistency across routes/modules**, not only “block production PR” or a security checklist. **Name cross-cutting invariants** to verify (from `REVIEWS.md`, ADRs, or architecture docs when present).

**Before `BLOCKERS` on a HIGH finding:**

1. **Trace one level deeper** — open the callee/import the finding cites; confirm the failure mode (throw vs return null vs early exit). This is the **Lite** pincer.
2. **Live-path gate** — before `[must-fix]` on a helper, schema, or validator: cite ≥1 **production** call site (not tests-only). Unused / tests-only drift → Advisory with `[latent_contract]`, not a blocker.
3. **Cross-module claims** — list affected files; line-by-line each boundary; prefer targeted tests / empirical checks over single-pass inference.
4. **Second pass when stakes are high** — consistency-focused re-run or stronger model when correctness lives in **wiring** (fallback chains, deploy pipelines, auth middleware, event → side-effect paths).

Do **not** treat more reasoning effort or a longer prompt as a substitute for (1)–(4). Prompt framing and call-chain depth move results more than “think harder.”

**Parent agent duty:** when delegating Pass 3, complete Pass 1 + §2b + §2c at the appropriate tier on HIGH-risk wiring **before** trusting a subagent `PASS` — see [Workflow with subagents](#workflow-with-subagents).

### Pass 2c — Pincer review (call-graph)

**Trigger:** when correctness lives in **wiring** — shared helpers, middleware, SDK/webhook clients, event → side-effect paths, MEDIUM/HIGH hunks from Pass 1, or any cross-module `BLOCKERS` claim from §2b. **Not** gated on Pass 2 (authorship). Tier from the table below; default **Lite**.

Bidirectional pass for **integration defects** — bugs in assumptions *between* modules, invisible in single-file review. Origin: **pincer / pinch** (Roma, пинцер манёвр) — situation model ↑, falsifiable role hypothesis ↓, reconcile (pinch).

**Scale to the diff.** This table is the **only** place that defines tier criteria:

| Tier | When | Run | Skip |
| --- | --- | --- | --- |
| **Skip** | LOW; copy/UI/docs; single-file; no shared boundary touched (**never** for HIGH) | — | Entire §2c |
| **Lite** | LOW–MEDIUM; 1–2 files; obvious call edge (page → hook → API) | §2b step 1 + **between-file prompts** on that edge only | Isolated harness, reconcile matrix, consolidation |
| **Standard** | MEDIUM, or HIGH without wide fan-in; shared helper, webhook, auth middleware, token/payment path | **Top-down + reconcile** on **changed symbols only** (1 hop); bottom-up summary for callees you touch | Multi-hop graph propagation, consolidation unless hash hits |
| **Full** | HIGH **and** wide fan-in, cross-module refactor, unexplained wiring, or very large multi-module call graph | Isolated three-pass harness — load [`FULL-PINCER.md`](./FULL-PINCER.md) | — |

**Heuristic:** PR fits one chat context, <5 changed symbols across <3 modules → **Lite**. Token redistribution on a landing page → **Lite**. Middleware used in twelve routes → **Standard**. Auth/session rewrite → **Full**.

#### Context Guard

If the diff / context window is truncated, **downgrade §2c to Lite** and **explicitly list** unseen modules as unverified integration risks. Do not claim Full/Standard coverage you did not read.

If the tier table selects **Full** but [`FULL-PINCER.md`](./FULL-PINCER.md) is unavailable (partial install), run **Standard** and mark the Full tier **unverified** in the report.

#### Between-file prompts (Lite and above)

- **Caller/callee assumptions** — Who creates this instance, how long does it live, can it be recreated?
- **Persistence boundary** — Mutable state: survive restart / crash / deploy / scale-out? In-memory vs disk/queue/DB mismatches are canonical pinch material.
- **Two mental models** — “What A does” vs “what B expects”; reconcile is the diff — start there, not after line-by-line confirmation.

#### Reconcile verdicts (Standard / Full)

| Verdict | Meaning | Findings |
| --- | --- | --- |
| **confirmed** | Role fits meaning; hypothesis holds | **None** — do not emit “leave as is” findings |
| **revise** | Role right; implementation or cohesion needs work | Complexity, hidden effects, drift-prone bookkeeping, errors, naming |
| **abandon** | Behaviour contradicts assumed role | (1) code for role absent → dead/speculative; (2) one unit, competing purposes (`coincidental_reuse`) → SRP split; (3) behaviour unexplained by role → wrong abstraction (inline / split / specialize) |

**Hard rule:** `confirmed` is exclusive with findings on that edge. If you emit any finding (blocker, advisory, or nit) for the edge, reconcile is `revise` or `abandon` — never `confirmed`.

**Lens:** **semantic compression** — repeated *meaning* through one path; unique meaning stays local. **Wrong abstraction costs more than a little duplication** — prefer **leave duplicated** when in doubt.

**Finding bar:** actionable only; every finding needs **evidence at a real line**; categories include `duplication`, `wrong_abstraction_level`, `boundary_violation`, `hidden_side_effect`, `error_handling`, `complexity`, `naming`, `dead_code`.

#### How to execute (Lite / Standard)

1. List **changed symbols** and **call edges** (grep, LSP, graph tool).
2. **Lite:** open the callee once (§2b step 1); run between-file prompts on that edge; stop.
3. **Standard:** bottom-up summary for touched callees → top-down role hypothesis from call sites → reconcile (pinch). Isolation between passes is ideal, not mandatory.
4. **Empirical check** — one per non-confirmed reconcile (see below).

### Empirical checks

Name concrete checks in Pass 1 and after non-confirmed reconciles. **Run** a check only if the host permits **and** the user asked for verification; otherwise emit it as a **required check** under `Empirical checks` in the report and leave execution to the human. Do not start fixing or inventing tests as part of the sensor emit (pipeline contract).

---

## Pass 3 — Structural bar (thermo-nuclear)

After Pass 1 (and 2 when agent-authored), audit for **code judo**: whole branches, helpers, or layers that can **disappear**.

> Perform a deep code quality audit of the change. Rethink structure so behavior stays the same but the implementation becomes **simpler, smaller, and more direct**. Measure twice, cut once.

**Ambition over politeness.** Do not rubber-stamp “it works.”

### Presumptive blockers

Block unless clearly justified:

| # | Blocker |
| --- | --- |
| 1 | Missed code judo — complexity preserved when deletion is plausible |
| 2 | File crosses the **repo's size limit** without decomposition (default **1k lines** when the repo defines none) |
| 3 | Spaghetti — ad-hoc `if`s on busy shared paths |
| 4 | Feature logic in general-purpose modules |
| 5 | Unearned abstraction — pass-through wrappers, magic handlers |
| 6 | Boundary mud — `any`, cast chains, silent fallbacks |
| 7 | Bespoke helper where a canonical util exists |
| 8 | Test dishonesty — title vs assertion mismatch |
| 9 | No tests for non-trivial behavior change |
| 10 | Test assertion gaming — weakened expectations to go green |
| 11 | CI / guard weakening — skipped tests, lowered thresholds, disabled lint |
| 12 | Prompt injection surface — untrusted input to LLM without policy |
| 13 | Integration contract mismatch — caller hypothesis contradicts callee reality (§2c pinch) on MEDIUM+ paths |
| 14 | **Task traceability** (repo overlay) — overlay defines it and agent-authored non-trivial code has no linked task reconciliation |

**Also load** repo-specific laws from `AGENTS.md` / lint rules when present. Repo `REVIEWS.md` may elevate #14 to a hard blocker; repo thresholds override #2's default.

### Primary questions

- Code-judo move that deletes branches/layers?
- Right file and layer?
- Abstraction earning its keep?
- Types explicit at boundaries?
- Orchestration unnecessarily sequential?

### Finding priority

1. Risk + unanswered Pass 1 questions (HIGH/MEDIUM)
2. Pass 1b operational-law violations
3. §2c pinch findings (contract mismatch on wiring)
4. Presumptive blockers
5. Missed dramatic simplification
6. Spaghetti / branching
7. Boundary / type problems
8. File size / decomposition
9. Style nits (only if nothing above)

**Deprioritize:** import order, line length, pre-existing warnings in untouched files.

---

## Output format

**Dual-ask:** if the user also wants product status (ready / next / roadmap / progress), answer that **first**, then emit the UCR sensor. Do not let the rubric crowd out the human's ask.

```markdown
### Ready
- …

### Next (per docs)
- … (cite ROADMAP / docs; mark gaps vs code)
```

### Core block (always emit)

```markdown
### Risk
HIGH | MEDIUM | LOW

### What could go wrong?
- …

### Review depth
- **Line-by-line:** …
- **Empirical checks:** … (required checks named here; run only if host permits and user asked)
- **Release guardrails:** feature flag | staging-only | shadow | none
- **Change set:** base `…` → head `…` (or PR #N)

### Verdict
PASS | ADVISORY | BLOCKERS
```

Then, only when non-empty:

```markdown
### Blockers
- [must-fix] …

### Advisory
- [should-fix] … (use `[example_bound_fix]` or `[latent_contract]` when applicable)
```

### Add-on block (emit only if the corresponding pass ran)

```markdown
### Task coverage
- **Claimed task(s):** `<uuid>` — description (not numeric ID alone)
- **Reconciled:** done | pending | new (`task add` listed below) | missing
- **New tasks needed:** exact `task add …` commands (or “none”)
- **Task verdict** (section-scoped — feeds the sensor verdict, is not it): pass | advisory | blocker

### Pincer (note tier: Lite | Standard | Full)
- **Situation model (bottom-up):** … *(Standard/Full)*
- **Role hypothesis (top-down):** …
- **Reconcile:** confirmed | revise | abandon — … *(Standard/Full)*
- **Consolidation:** extract | leave | inline/split — … *(Full only)*

### Decision audit
- **Choices:** … (product / API / error / scope / test only)
- **Example-bound?** yes | no — …
- **Open debt:** …
- **Stand behind in prod?** yes | no — if no, exact gaps

### Code judo
- High-impact structural simplifications only.

### Nits
- Only if verdict is `PASS` or `ADVISORY`, and the list is short. (Omit on `BLOCKERS`.)
```

**Verdict rules:**

- `BLOCKERS` — HIGH with open Pass 1 questions, any presumptive blocker, or repo law violated
- `ADVISORY` — no blockers; meaningful simplification still recommended
- `PASS` — risk acceptable; no structural regression; “it works” is not enough alone

**Who acts on what:**

- `Blockers` → safe input for agent fix loops (when the harness enables them)
- `Advisory` / `Nits` → human decision only; out of scope for unprompted agent follow-up

**Consistency lock (non-negotiable):**

- `### Verdict` is the **only** sensor verdict; section-scoped verdicts (Task coverage, reconcile) never substitute for it
- Non-empty `### Blockers` ⇒ `### Verdict` **must** be `BLOCKERS`
- `ADVISORY` or `PASS` ⇒ omit `### Blockers` entirely (move items to Advisory / Nits)
- Decision audit `Stand behind in prod? no` ⇒ cannot be `PASS`; if the gaps are must-fix, verdict is `BLOCKERS`

**Pre-send checklist** (run before finishing — especially on smaller / faster models):

1. `### Blockers` omitted iff verdict ≠ `BLOCKERS`; no empty or placeholder-filled sections
2. Each `[must-fix]` cites a live production path or runtime call site (not tests-only)
3. Pincer `confirmed` ⇒ no findings on that edge
4. Dual-ask answered first when the user asked ready / next / roadmap
5. Change set (base/head) recorded; HIGH used §2c per tier table (never Skip)

---

## Workflow with subagents

**Fresh UCR reviewer (optional):** see [Fresh context](#fresh-context-optional) — same rubric, review package only, no alternate checklist.

**Structure subagent (Pass 3):** when a structure-only subagent exists (e.g. Cursor Task `subagent_type: "thermo-nuclear-code-quality-review"`), or a sibling thermo-nuclear **skill** on hosts without that subagent:

1. Parent loads **this skill** (and repo `REVIEWS.md` if it exists).
2. Parent completes **Pass 0 + Pass 1** (+ Pass 1b when the overlay defines operational laws; Pass 2 if agent-authored; **§2b always**; **§2c** when wiring is at stake).
3. Invoke the subagent with diff + file contents **and** explicit instruction: apply Pass 3 only on Pass-1-flagged hunks; output must include the Pass 1 summary + this skill’s verdict. **Subagent output alone is not enough** for HIGH-risk cross-module wiring — the parent verifies §2b and §2c when triggered.

**If no structure subagent is available:** run Pass 3 in this same thread. Never omit the structural bar.

---

## Further reading (not loaded by default)

- [`FULL-PINCER.md`](./FULL-PINCER.md) — §2c **Full** tier harness only.
- [`SOURCES.md`](./SOURCES.md) — provenance and credits; not required to execute this skill.
