# Fixed review prompt — UCR reference fixture

Copy this prompt verbatim for each model run. Change only host/model metadata when scoring.

**Prerequisite:** agent workspace must be **`reference/fixture`** only (not the parent `unified-code-review` repo). See [`README.md`](./README.md).

---

Load the **unified-code-review** skill.

Review **this codebase** (treat it as a branch/repo audit of the current tree).

**Scope (only these paths):**

- `src/`
- `tests/`
- `package.json`, `README.md` in this directory

**Out of scope — do not read:**

- Any parent directory (`../`, `reference/maintainers/`, repo root `README.md`, `SKILL.md`)
- Files named `EXPECTED`, `SCORECARD`, or paths containing `maintainers`

**Rules:**

- Sensor only — do **not** fix code or open PRs.
- Apply the full UCR output template from the skill.
- Run the pre-send checklist before you finish.
- If you run tests, report results; do not treat green tests as proof the review is complete.

**Deliver:** UCR sensor output (`### Risk` through `### Nits` as applicable).

---
