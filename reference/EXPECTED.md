# Gold key — UCR reference fixture

**Maintainers:** use after a model run to score catches. Do not paste into the review prompt.

## Planted bugs

### P1 — must-catch (§2c Lite pincer)

| | |
| --- | --- |
| **Files** | `fixture/src/userRoute.js`, `fixture/src/getUser.js` |
| **Bug** | `handleUserRequest` wraps `getUser` in try/catch and documents that callers expect **throw on missing**. `getUser` returns **`null`** when not found. |
| **Failure mode** | Missing user → `user` is `null` → `` `Hello, ${user.name}` `` throws **TypeError** (not caught as 404). Wrong branch / crash instead of graceful not-found. |
| **Good finding** | Contract mismatch between caller hypothesis and callee behavior; cite both files; reconcile `revise` or `abandon`, not `confirmed`. |

### P2 — must-catch (live runtime path)

| | |
| --- | --- |
| **Files** | `fixture/src/paymentCommands.js`, `fixture/src/i18n.js` |
| **Bug** | Loop `for (const t of SUBSCRIPTION_TIERS)` **shadows** i18n `t` imported from `./i18n`. Body calls **`t2(...)`**, which is **undefined** → `ReferenceError` when `buildSubscribeMessage()` runs. |
| **Failure mode** | `/subscribe` without tier argument crashes at runtime. |
| **Good finding** | `[must-fix]` with production call path; note shadowing, not only “typo t2→t”. |

### A1 — advisory (`[latent_contract]`)

| | |
| --- | --- |
| **Files** | `fixture/src/InputValidator.js`, `fixture/src/keyboards.js`, `fixture/tests/InputValidator.test.js` |
| **Drift** | UI (`keyboards.js`) offers `2:3`, `3:2` and uppercase modes (`FAST`, …). Validator allows only `1:1`/`9:16`/`16:9` and lowercase modes. |
| **Live path** | **None** — `validateGenerationParams` is only imported from **tests**. Production keyboards do not call the validator. |
| **Good finding** | `[latent_contract]` or advisory schema drift; cite tests-only usage. |
| **Wrong** | `[must-fix]` or BLOCKERS solely from reading `InputValidator.js` without call-site grep. |

### N1 — must-not (guardrail check)

| | |
| --- | --- |
| **Check** | Model elevates A1 to `[must-fix]` and/or emits **ADVISORY** with non-empty **Blockers** (consistency lock violation). |
| **Pass** | A1 at advisory/`[latent_contract]` only; if P1/P2 found as must-fix → verdict **BLOCKERS** with non-empty Blockers; if only A1 → **ADVISORY** with empty Blockers. |

## Expected verdict (typical good run)

When the reviewer finds **P1** and **P2** as must-fix:

- **Verdict:** `BLOCKERS`
- **Blockers:** P1 and P2 (with file evidence)
- **Advisory:** A1 as `[latent_contract]` if mentioned
- **Pincer:** `revise` or `abandon` on the getUser/userRoute edge — **not** `confirmed` if any finding is listed for that edge

When the reviewer finds only drift issues (A1) and misses P1/P2:

- Score **miss** on P1/P2; do not treat as a passing run.

## Empirical checks (optional)

```bash
cd reference/fixture && npm test
```

Tests pass; they do **not** exercise P1 or P2. Green CI is intentional bait for rubber-stamp reviews.
