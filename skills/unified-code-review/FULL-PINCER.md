# Appendix: Full pincer harness

Load **only** for §2c **Full** tier (HIGH + wide fan-in / cross-module refactor / unexplained wiring). Lite and Standard must not pay this context cost. Tier criteria live in the tier table in [`SKILL.md`](./SKILL.md) — this file assumes Full was already selected.

## Isolation rule

Run **bottom-up**, **top-down**, and **reconcile** as **independent passes** — separate context, no peeking:

| Pass | Sees | Must NOT see |
| --- | --- | --- |
| **Bottom-up** (situation model) | Function body, metrics, **callee cards** already built | Caller assumptions, refactor advice |
| **Top-down** (role hypothesis) | Signature, representative **call sites**, caller context cards | **Callee body** — judge only from how it is called |
| **Reconcile** (pinch) | Both cards + metrics + duplicate candidates | — (hypothesis testing only) |

Context must not leak between passes; top-down that has read the body is **cheating** and invalidates the pinch.

## The three waves

**Situation model** — bottom-up (callees → callers). Build domain meaning, not paraphrase: **irreducible behavior** vs **ceremony** (plumbing that could move); genuine **side effects** only (I/O, mutation, globals, throws — not ordinary local reads/calls); **manual bookkeeping** that can drift from reality; **error behaviour**.

**Role hypothesis** — top-down (callers → callees). Write a **falsifiable** one-sentence contract: what callers **should** get; **expected effects** they assume; **concept cohesion** (`shared_concept` | `coincidental_reuse` | `mixed`); **misuse patterns**; **blast radius** from fan-in.

**Reconcile** (pinch) — compare at each node: does the assumed role hold against actual behaviour?

**Abstraction test:** the top-down hypothesis should be obvious from boundary + call sites. **Intent leak** when it isn't (advisory, or blocker on MEDIUM+). A **too-clean** role summary that drops essential behaviour is itself a defect.

## Execution steps

1. List **changed symbols** and **call edges**.
2. **Bottom-up** — build callee cards first; propagate situation summaries up one hop at a time.
3. **Top-down** — from call sites only, write falsifiable role hypothesis + expected effects (**no callee body**).
4. **Reconcile** — pinch; map mismatches to failure modes (silent wrong result > loud crash).
5. **Empirical check** — one per non-confirmed reconcile, under the run-vs-recommend rule in `SKILL.md`.
6. Optional **consolidation** on near-duplicate clusters (below).

Reconcile verdicts (`confirmed` | `revise` | `abandon`) and the finding bar are defined in `SKILL.md` — same rules apply here.

## Consolidation (optional — duplicate clusters)

After SimHash / structural near-duplicate candidates on **large** changesets, review the **whole cluster** at once (not pairwise):

| Verdict | When |
| --- | --- |
| **extract** | Shared genuine meaning, clear axis of variation, honest name, call sites read clearer after |
| **leave** | Coincidental similarity, different meanings, or shared abstraction needs parameter soup — **default when in doubt** |
| **inline / split** | Already over-abstracted; specialize instead |

Hash alone is not proof — semantic confirm before any extract recommendation.

**Analogy (optional, humans):** Full pincer has the same geometry as hybrid interprocedural analysis / assume–guarantee checking — run it when correctness lives in wiring across many modules.
