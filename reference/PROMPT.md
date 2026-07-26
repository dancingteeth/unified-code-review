# Fixed review prompt — UCR reference fixture

Copy this prompt verbatim for each model run. Change only the host/model metadata when scoring.

---

Load the **unified-code-review** skill.

Review the codebase at **`reference/fixture`** in this repository (treat it as a branch/repo audit of the current tree).

**Scope:** `reference/fixture/src/` and `reference/fixture/tests/`.

**Rules:**

- Sensor only — do **not** fix code or open PRs.
- Apply the full UCR output template from the skill.
- Run the pre-send checklist before you finish.
- If you run tests, report results; do not treat green tests as proof the review is complete.

**Deliver:** UCR sensor output (`### Risk` through `### Nits` as applicable).

---
