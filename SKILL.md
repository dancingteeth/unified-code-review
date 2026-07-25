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
  version: "1.2.0"
---

# Unified Code Review

One process, three passes (+ **§2c pincer** when wiring is at stake — **tiered**, not always full). **Do not** run structure-only review.

**Output is a sensor, not a merge verdict.** Human owns merge, especially on HIGH-risk paths.

## TL;DR — quick start

For a typical PR / branch audit:

1. **Pass 1** — classify risk by blast radius; answer the five questions; decide line-by-line vs skim.
2. **Pass 1b** — only if the repo defines enforceable workflow laws (task/deploy/issue). Else skip.
3. **Pass 2 / 2b** — if agent-authored (or you are the reviewing LLM): intent evidence, tests first, trace one level deeper before BLOCKERS.
4. **§2c** — default **Lite** (between-file prompts on the changed edge). Escalate to Standard/Full only per the tier table. Skip on pure LOW/copy/docs.
5. **Pass 3** — structural bar (code judo, presumptive blockers) on Pass-1-flagged hunks.
6. Emit the **output template** → verdict.

You are the LLM reviewer: apply §2b to yourself. Prefer running all passes in one thread; use a thermo-nuclear / structure subagent only for Pass 3 when available.

## Definitions

| Term | Meaning |
| ---- | ------- |
| **Code judo** | Prefer deletion: whole branches, helpers, or layers that can disappear while behavior stays the same — simpler, smaller, more direct. |
| **Pincer (§2c)** | Bidirectional check on wiring: what callers assume vs what callees actually do. Catches integration bugs invisible in single-file review. |
| **Lite / Standard / Full** | Pincer depth. Default **Lite**. **Full** (isolated three-pass harness) is rare — see [Appendix: Full pincer harness](#appendix-full-pincer-harness). |

**Code judo example:** a 40-line “adapter” that only forwards kwargs to one function → delete the adapter; call the function at the call sites.

**Pincer catch example:** callers treat `getUser(id)` as “throws if missing”; callee returns `null`. Silent NPE / wrong branch downstream. Reconcile: role hypothesis fails — fix contract or call sites (do not BLOCKER on “throws” without opening the callee).

---

## Pass overview


| Pass                                    | Focus                                                                                              |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **1. Risk**                             | Blast radius, failure modes, what to read line-by-line                                             |
| **1b. Operational laws**                | Repo overlay only — task traceability, deploy/issue laws from `REVIEWS.md` / `AGENTS.md`           |
| **2. Agent-authored** (when applicable) | Intent evidence, test hunks first; **agent-as-reviewer** limits (§2b); **call-graph pincer** (§2c) |
| **3. Structure**                        | Code judo, blockers, decomposition (thermo-nuclear bar)                                            |
| **Verdict**                             | PASS \| ADVISORY \| BLOCKERS                                                                       |


---

## Which rubric wins (repo overlay)

Check in this order; **stop at the first that exists**:

1. `REVIEWS.md` at repo root — canonical for that project.
2. `AGENTS.md` / `CONTRIBUTING.md` / `.cursor/rules/*` — repo laws and review hints.
3. **This skill** — portable default when nothing else is defined.

If the repo has `REVIEWS.md`, load it **instead of** relying on the generic risk examples below. Still apply this skill’s **process order** (risk → agent-authored → operational laws when defined → structure → verdict). Repo overlays commonly add **project-specific cross-module invariants** (data-boundary rules, tier/serialization contracts) or **task traceability** laws — use those when present, and let repo thresholds (file size, verdict tiers) **override** this skill’s defaults.

**Pass 1b:** skip when the overlay has **no enforceable workflow laws** (task trackers, issue keys, deploy gates) — even if `REVIEWS.md` exists. Do not invent Taskwarrior (or similar) checks for repos that do not use them.

---

## Pass 1b — Operational laws (repo overlay only)

Run **only when** `REVIEWS.md`, `AGENTS.md`, or `.cursor/rules/`* define enforceable workflow laws. **Skip** otherwise (see above).

**When the overlay defines task traceability** (wherever it lives — a `REVIEWS.md` section, an `AGENTS.md` core law, or a contributor doc):

1. Load the repo’s task-session skill if referenced (e.g. `packages/skills/taskwarrior-session/SKILL.md`).
2. Run the overlay’s falsifiable checks before Pass 3 — intent link, scope reconciliation (`done` | `pending` | `task add`), no orphan non-trivial code hunks.
3. Apply the overlay’s **verdict tier** — repo may make agent-authored `src/`** gaps a presumptive blocker; portable default is **ADVISORY** unless the repo says otherwise.
4. List exact `task add …` command strings for follow-ups from the review, even if not executed in-session.

**Empirical pattern:** `task list` / `task <uuid> info` (or the repo’s equivalent CLI) — cite **UUID** in the **Task coverage** section; numeric ID is not a stable link.

If the repo rubric already contains a full task-traceability section, **that section wins** over this summary.

---

## vs `/thermo-nuclear-code-quality-review` alone

Structure-only rubrics (Cursor Team Kit thermo-nuclear subagent, or an equivalent sibling skill) cover **Pass 3 only**. They miss risk triage, agent-authored discipline, and this verdict format.


| Invocation                                                                              | Gets you                                        |
| --------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Structure subagent / skill **only**                                                     | ~Pass 3 structure; misses risk and agent checks |
| **This skill** then structure pass (or one agent with this skill loaded)                | Full unified review                             |
| **Repo-provided review runner** (when the repo ships one that inlines its `REVIEWS.md`) | Full repo rubric                                |


**Without a repo runner:** load **this skill** (plus repo `REVIEWS.md` if present). If no thermo-nuclear / structure **subagent** is registered in this host, run Pass 3 in the same thread — do not skip structure.

---

## Pass 1 — Risk triage (always first)

Classify by **blast radius**, not diff size (Rahul GS framing — see Sources).

### Risk levels (generic)


| Level      | Examples                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| **HIGH**   | Auth/session, payments, PII, secrets, production DB migrations, deploy/infra, new network egress, security-sensitive paths |
| **MEDIUM** | Business logic, integrations, webhooks, user-facing behavior, performance-critical paths                                   |
| **LOW**    | UI/copy, docs, formatting, internal tooling, test-only refactors with coverage                                             |


When a change spans levels, report the **highest** and map hunks to levels.

### Answer before deep review

1. **What could go wrong?** — concrete failure modes.
2. **Line-by-line vs skim?** — which files/hunks need careful reading.
3. **Empirical checks?** — specific tests, CI command, manual steps.
4. **Release guardrails?** — feature flag, staging-only, shadow mode.
5. **Faster-merge guardrails?** — tests to add, rollback plan.

**Routing:**

- **HIGH** → default **BLOCKERS** until questions answered; never PASS on structure alone; **§2c Full** on changed call edges.
- **MEDIUM** → line-by-line on boundaries; **§2c Lite or Standard** when the diff touches shared helpers or multi-route behavior; tests required for behavior changes.
- **LOW** → structure + spot-check; lean on CI; **§2c Skip** unless a cross-module smell is obvious (then Lite).

---

## Pass 2 — Agent-authored changes (when applicable)

Treat agent output as **unreviewed external contribution** — plausible code, missing intent (Osmani — see Sources).

**Require intent evidence before deep review:**

- PR/MR description, issue link, or short what / why / out of scope.
- Agent loops: frozen goal spec + verifier output — not the agent’s “done” message.

**Review order:**

1. **Test hunks first** — assertion gaming is common; green CI ≠ correct until test edits are justified.
2. **Implementation** — line-by-line on §1-flagged hunks.
3. **CI / guard diffs** — skipped tests, lowered coverage, disabled lint.

**Small diffs:** review works best on chunks you would throw away if derailed (Giacomelli — see Sources).

**Example-bound fixes:** flag when a change handles the demonstrated case (fixture, repro, sample path) but not the general class (other callers, inputs, error modes). Emit as Advisory `[example_bound_fix]` unless it leaves a MEDIUM+ failure mode open — then Blocker.

**Decision audit (optional — MEDIUM+ agent-authored, or when the same agent authored and reviews):** short dump of product/API/error/scope/test choices only — not style nits. For each: why, alternative considered (or “none”), confidence `high | medium | low` + what would falsify it. End with: stand behind in prod? `yes | no` — if no, exact gaps. Do not rewrite code in this step; surface decisions for the human.

### Pass 2b — Agent-as-reviewer (you are the LLM reviewer)

**This agent running the skill is the LLM reviewer.** Apply the rules below to yourself — not only to a nested subagent.

Applies to **any model** running a branch/repo audit. Empirical pattern: Kilo — agent code review prompt sensitivity (see Sources).


| Reviewer tends to catch                                             | Reviewer tends to miss                                                                                     |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Local bugs in one function/file (auth hole, bad SQL, missing guard) | **Product rules spread across modules** (same filter on search + export + webhook + batch job)             |
| Security/hardening when prompted generically (“block production”)   | **Call-chain claims without opening callees** (“X throws” while callee catches and returns null)           |
| Straightforward codebases consistently                              | **Run-to-run variance** on harder repos; strict security framing can chase nits and skip behavioral wiring |


**Review prompt (agent or human):** ask for **behavior and consistency across routes/modules**, not only “block production PR” or a security checklist. **Name cross-cutting invariants** to verify (from `REVIEWS.md`, ADRs, or architecture docs when the repo has them).

**Before BLOCKERS on an agent HIGH finding:**

1. **Trace one level deeper** — open the callee/import the finding cites; confirm the failure mode (throw vs return null vs early exit).
2. **Cross-module claims** — list affected files; line-by-line each boundary; prefer targeted tests / empirical checks over single-pass inference.
3. **Second pass when stakes are high** — consistency-focused re-run or stronger model when correctness lives in **wiring** (fallback chains, deploy pipelines, auth middleware, event → side-effect paths).

Do **not** treat more reasoning effort or a longer prompt as a substitute for (1)–(3). Prompt framing and call-chain depth usually move results more than “think harder.”

**Parent agent duty:** when delegating to thermo-nuclear or another subagent, complete Pass 1 + §2b + §2c at the **appropriate tier** on HIGH-risk wiring **before** trusting a single subagent PASS.

### Pass 2c — Pincer review (call-graph)

Bidirectional pass for **integration defects** — bugs in assumptions *between* modules, invisible in single-file review (Pipeline — see Sources). Run explicitly when correctness lives in **wiring**.

**Origin:** **pincer / pinch** — Roma (@cesmpi on Telegram, пинцер манёвр): situation model ↑, falsifiable role hypothesis ↓, reconcile (pinch). Roma’s **Full** harness targets large C++ / wide fan-in codebases; most web/app work needs **Lite** or **Standard**.

**Scale to the diff** — default **Lite**, not Full:


| Tier         | When                                                                                                       | Run                                                                                                   | Skip                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Skip**     | LOW; copy/UI/docs; single-file; no shared boundary touched                                                 | —                                                                                                     | Entire §2c                                                  |
| **Lite**     | LOW–MEDIUM; 1–2 files; obvious call edge (page → hook → API)                                               | §2b step 1 + **between-file prompts** on that edge only                                               | Isolated harness, reconcile matrix, consolidation           |
| **Standard** | MEDIUM; shared helper, webhook, auth middleware, token/payment path                                        | **Top-down + reconcile** on **changed symbols only** (1 hop); bottom-up summary for callees you touch | Multi-hop graph propagation, consolidation unless hash hits |
| **Full**     | HIGH; wide fan-in; refactor across modules; agent can’t explain wiring; very large multi-module call graph | Isolated three-pass harness — see [Appendix](#appendix-full-pincer-harness)                           | —                                                           |


**Heuristic:** if the PR fits in one chat context and has <5 changed symbols across <3 modules → **Lite**. Token redistribution on a landing page → **Lite**. Middleware used in twelve routes → **Standard**. Auth/session rewrite → **Full**.

#### Context Guard

If the diff / context window is truncated, **downgrade §2c to Lite** and **explicitly list** unseen modules as unverified integration risks. Do not claim Full/Standard coverage you did not read.

**When to run (any tier above Skip):** MEDIUM/HIGH hunks from Pass 1; shared helpers, middleware, SDK/webhook clients, event → side-effect paths; any cross-module BLOCKER claim from §2b.

#### Between-file prompts (Lite and above)

During top-down + reconcile:

- **Caller/callee assumptions** — Who creates this instance, how long does it live, can it be recreated?
- **Persistence boundary** — Mutable state: survive restart / crash / deploy / scale-out? In-memory vs disk/queue/DB mismatches are canonical pinch material.
- **Two mental models** — “What A does” vs “what B expects”; reconcile is the diff — start there, not after line-by-line confirmation.

#### Reconcile verdicts (Standard / Full)


| Verdict       | Meaning                                           | Findings                                                                                                                                                                                              |
| ------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **confirmed** | Role fits meaning; hypothesis holds               | **None** — do not emit “leave as is” findings                                                                                                                                                         |
| **revise**    | Role right; implementation or cohesion needs work | Complexity, hidden effects, drift-prone bookkeeping, errors, naming                                                                                                                                   |
| **abandon**   | Behaviour contradicts assumed role                | (1) code for role absent → dead/speculative; (2) one unit, competing purposes (`coincidental_reuse`) → SRP split; (3) behaviour unexplained by role → wrong abstraction (inline / split / specialize) |


**Lens:** **semantic compression** — repeated *meaning* through one path; unique meaning stays local. **Wrong abstraction costs more than a little duplication** — prefer **leave duplicated** when in doubt.

**Finding bar:** actionable only; every finding needs **evidence at a real line**; categories include `duplication`, `wrong_abstraction_level`, `boundary_violation`, `hidden_side_effect`, `error_handling`, `complexity`, `naming`, `dead_code`.

#### How to execute (Lite / Standard)

1. List **changed symbols** and **call edges** (grep, LSP, graph tool).
2. **Lite:** open the callee once (§2b step 1); run between-file prompts on that edge; stop.
3. **Standard:** bottom-up summary for touched callees → top-down role hypothesis from call sites → reconcile (pinch). Isolation between passes is ideal, not mandatory.
4. **Empirical check** — one targeted test or manual step per non-confirmed reconcile.

**Pairs with §2b:** “trace one level deeper” = **Lite** pincer. **Standard** adds reconcile on changed edges. **Full** = Appendix.

---

## Pass 3 — Thermo-nuclear structural bar

After Pass 1 (and 2 if agent-authored), audit for **code judo**: whole branches, helpers, or layers that can **disappear**.

> Perform a deep code quality audit of the change. Rethink structure so behavior stays the same but the implementation becomes **simpler, smaller, and more direct**. Measure twice, cut once.

**Ambition over politeness.** Do not rubber-stamp “it works.”

### Presumptive blockers

Block unless clearly justified:


| #   | Blocker                                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Missed code judo — complexity preserved when deletion is plausible                                                                                           |
| 2   | File crosses the **repo's size limit** without decomposition (default **1k lines** when the repo defines none)                                               |
| 3   | Spaghetti — ad-hoc `if`s on busy shared paths                                                                                                                |
| 4   | Feature logic in general-purpose modules                                                                                                                     |
| 5   | Unearned abstraction — pass-through wrappers, magic handlers                                                                                                 |
| 6   | Boundary mud — `any`, cast chains, silent fallbacks                                                                                                          |
| 7   | Bespoke helper where a canonical util exists                                                                                                                 |
| 8   | Test dishonesty — title vs assertion mismatch                                                                                                                |
| 9   | No tests for non-trivial behavior change                                                                                                                     |
| 10  | Test assertion gaming — weakened expectations to go green                                                                                                    |
| 11  | CI / guard weakening — skipped tests, lowered thresholds, disabled lint                                                                                      |
| 12  | Prompt injection surface — untrusted input to LLM without policy                                                                                             |
| 13  | Integration contract mismatch — caller hypothesis contradicts callee reality (§2c pinch) on MEDIUM+ paths                                                    |
| 14  | **Task traceability** (repo overlay) — when `REVIEWS.md` / `AGENTS.md` defines it and agent-authored non-trivial code work has no linked task reconciliation |


**Also load** repo-specific laws from `AGENTS.md` / lint rules when present. Repo `REVIEWS.md` may elevate #14 to a hard blocker; repo thresholds override #2's default.

### Primary questions

- Code-judo move that deletes branches/layers?
- Right file and layer?
- Abstraction earning its keep?
- Types explicit at boundaries?
- Orchestration unnecessarily sequential?

### Finding priority

1. Risk + unanswered Pass 1 questions (HIGH/MEDIUM)
2. Pass 1b operational-law violations (task traceability when repo defines it)
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

```markdown
### Risk
HIGH | MEDIUM | LOW

### What could go wrong?
- …

### Review depth
- **Line-by-line:** …
- **Empirical checks:** …
- **Release guardrails:** feature flag | staging-only | shadow | none

### Task coverage (when Pass 1b ran; omit when n/a)
- **Claimed task(s):** `<uuid>` — description (not numeric ID alone)
- **Reconciled:** done | pending | new (`task add` listed below) | missing
- **New tasks needed:** exact `task add …` commands (or “none”)
- **Verdict:** pass | advisory | blocker

### Pincer (optional — when §2c ran; note tier: Lite | Standard | Full)
- **Situation model (bottom-up):** … *(Standard/Full)*
- **Role hypothesis (top-down):** …
- **Reconcile:** confirmed | revise | abandon — … *(Standard/Full)*
- **Consolidation:** extract | leave | inline/split — … *(Full only)*

### Decision audit (optional — Pass 2; omit when n/a)
- **Choices:** … (product / API / error / scope / test only)
- **Example-bound?** yes | no — …
- **Open debt:** …
- **Stand behind in prod?** yes | no — if no, exact gaps

### Verdict
PASS | ADVISORY | BLOCKERS

### Blockers
- [must-fix] …

### Advisory
- [should-fix] … (use `[example_bound_fix]` when applicable) …

### Code judo (optional)
- High-impact structural simplifications only.

### Nits (optional)
- Only if PASS and list is short.
```

**Verdict rules:**

- **BLOCKERS** — HIGH with open Pass 1 questions, any presumptive blocker, or repo law violated
- **ADVISORY** — no blockers; meaningful simplification still recommended
- **PASS** — risk acceptable; no structural regression; “it works” is not enough alone

---

## Workflow with structure subagent

When a structure-only subagent exists (e.g. Cursor Task `subagent_type: "thermo-nuclear-code-quality-review"`), or a sibling thermo-nuclear **skill** on hosts without that subagent:

1. Parent loads **this skill** (and repo `REVIEWS.md` if it exists).
2. Parent completes **Pass 1** (+ Pass 1b when repo defines operational laws; Pass 2 / **2b** / **2c** if agent-authored, agent-as-reviewer, or wiring at stake).
3. Invoke structure subagent/skill with diff + file contents **and** explicit instruction: apply Pass 3 only on hunks flagged in Pass 1; output must include Pass 1 summary + verdict from this skill. **Subagent output alone is not enough** for HIGH-risk cross-module wiring — parent must verify §2b and §2c when triggered.

**If no structure subagent is available:** run Pass 3 in this same thread. Do not omit the structural bar.

---

## Appendix: Full pincer harness

Use **only** for §2c **Full** tier (HIGH / wide fan-in / unexplained wiring). Lite and Standard must not pay this context cost.

For **Full**, run **bottom-up**, **top-down**, and **reconcile** as **independent passes** — separate context, no peeking:


| Pass                            | Sees                                                           | Must NOT see                                       |
| ------------------------------- | -------------------------------------------------------------- | -------------------------------------------------- |
| **Bottom-up** (situation model) | Function body, metrics, **callee cards** already built         | Caller assumptions, refactor advice                |
| **Top-down** (role hypothesis)  | Signature, representative **call sites**, caller context cards | **Callee body** — judge only from how it is called |
| **Reconcile** (pinch)           | Both cards + metrics + duplicate candidates                    | — (hypothesis testing only)                        |


Context must not leak between passes; top-down that has read the body is **cheating** and invalidates the pinch.

### The three waves


| Wave                  | Direction                     | Build                                                                                                                                                                                                                                                                         |
| --------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Situation model**   | Bottom-up (callees → callers) | Domain meaning, not paraphrase: **irreducible behavior** vs **ceremony** (plumbing that could move); genuine **side effects** only (I/O, mutation, globals, throws — not ordinary local reads/calls); **manual bookkeeping** that can drift from reality; **error behaviour** |
| **Role hypothesis**   | Top-down (callers → callees)  | **Falsifiable** one-sentence contract: what callers **should** get; **expected effects** they assume; **concept cohesion** (`shared_concept` \| `coincidental_reuse` \| `mixed`); **misuse patterns**; **blast radius** from fan-in                                           |
| **Reconcile** (pinch) | Compare at each node          | Hypothesis testing — does assumed role hold against actual behaviour?                                                                                                                                                                                                         |


**Abstraction test:** top-down hypothesis should be obvious from boundary + call sites. **Intent leak** when it isn't (advisory or blocker on MEDIUM+). **Too-clean** role summary that drops essential behaviour is itself a defect.

### Full execution steps

1. List **changed symbols** and **call edges**.
2. **Bottom-up** — build callee cards first; propagate situation summaries up one hop at a time.
3. **Top-down** — from call sites only, write falsifiable role hypothesis + expected effects (**no callee body**).
4. **Reconcile** — pinch; map mismatches to failure modes (silent wrong result > loud crash).
5. **Empirical check** — one targeted test or manual step per non-confirmed reconcile.
6. Optional **consolidation** on near-duplicate clusters (below).

### Consolidation (Full only — optional duplicate clusters)

After SimHash / structural near-duplicate candidates on **large** changesets, review the **whole cluster** at once (not pairwise):


| Verdict            | When                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| **extract**        | Shared genuine meaning, clear axis of variation, honest name, call sites read clearer after                         |
| **leave**          | Coincidental similarity, different meanings, or shared abstraction needs parameter soup — **default when in doubt** |
| **inline / split** | Already over-abstracted; specialize instead                                                                         |


Hash alone is not proof — semantic confirm before any extract recommendation.

**Analogy (optional, humans):** Full pincer has the same geometry as hybrid interprocedural analysis / assume–guarantee checking — run it when correctness lives in wiring across many modules.

---

## Sources

Human context and provenance — **not required reading for the agent** to execute this skill.


| Contribution                                                                                                                                        | Credit                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Pincer harness** (isolated bottom-up / top-down / reconcile; situation model; falsifiable hypothesis; semantic compression; consolidation)        | Roma [@cesmpi](https://t.me/cesmpi)                                                                             |
| **Between-file review prompts** (caller/callee assumptions, persistence boundaries, two mental models)                                              | [Buggy Code Review: The Pipeline](https://vibeagentmaking.com/blog/buggy-code-review-the-pipeline/)             |
| Risk by blast radius                                                                                                                                | [Rahul GS](https://x.com/rahulgs/status/2067257255825686880)                                                    |
| Agent-authored discipline                                                                                                                           | [Addy Osmani — Agentic Code Review](https://addyosmani.com/blog/agentic-code-review/)                           |
| Small-diff review                                                                                                                                   | [Jan Giacomelli](https://jangiacomelli.com/blog/3-tips-for-ai-code-review-that-doesnt-suck/)                    |
| Agent-as-reviewer limits (Pass 2b)                                                                                                                  | [Kilo — prompt sensitivity](https://blog.kilo.ai/p/glm-52s-code-reviews-are-only-as-424)                        |
| Structural bar (Pass 3)                                                                                                                             | Cursor Team Kit `thermo-nuclear-code-quality-review`                                                            |
| Acceleration / review whiplash                                                                                                                      | [Faros AI](https://www.faros.ai/blog/ai-acceleration-whiplash-takeaways)                                        |
| Empirical proof of AI code bloat and missing context feedback                                                                                       | [Human-AI Synergy in Agentic Code Review (Zhong et al., arXiv:2603.15911)](https://arxiv.org/html/2603.15911v1) |
