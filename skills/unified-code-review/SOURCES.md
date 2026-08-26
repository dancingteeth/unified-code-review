---
tags:
  - agents
  - documentation
---
# Sources — Unified Code Review

Human context and provenance for [`SKILL.md`](./SKILL.md). **Not required reading for the agent** to execute the skill; it is kept out of the skill file to save context on every run.

| Contribution | Credit |
| --- | --- |
| **Reversibility / verification gap** as explicit Pass 1 questions; sensor ≠ auto-merge; eval sampling on logged reviews | [Claire Vo — Merge Mommy / How I AI](https://www.chatprd.ai/how-i-ai/merge-mommy-vercel-eve-ai-bot-for-auto-reviewing-pull-requests) ([Lenny’s Newsletter summary](https://www.lennysnewsletter.com/p/how-i-ai-build-an-ai-code-review)); Intercom AI-approved PRs (speed + revert evidence cited there) |
| **Pincer harness** (isolated bottom-up / top-down / reconcile; situation model; falsifiable hypothesis; semantic compression; consolidation) | Roma [@cesmpi](https://t.me/cesmpi) |
| **Between-file review prompts** (caller/callee assumptions, persistence boundaries, two mental models) | [Buggy Code Review: The Pipeline](https://vibeagentmaking.com/blog/buggy-code-review-the-pipeline/) |
| Risk by blast radius | [Rahul GS](https://x.com/rahulgs/status/2067257255825686880) |
| Agent-authored discipline | [Addy Osmani — Agentic Code Review](https://addyosmani.com/blog/agentic-code-review/) |
| Small-diff review | [Jan Giacomelli](https://jangiacomelli.com/blog/3-tips-for-ai-code-review-that-doesnt-suck/) |
| Agent-as-reviewer limits (§2b) | [Kilo — prompt sensitivity](https://blog.kilo.ai/p/glm-52s-code-reviews-are-only-as-424) |
| Structural bar (Pass 3) | Cursor Team Kit `thermo-nuclear-code-quality-review` |
| Acceleration / review whiplash | [Faros AI](https://www.faros.ai/blog/ai-acceleration-whiplash-takeaways) |
| Presentation ≠ proof; trust/spray | [Kilo — Code Is Cheap. Review Is Expensive.](https://blog.kilo.ai/p/code-is-cheap-review-is-expensive) |
| Empirical proof of AI code bloat and missing context feedback | [Human-AI Synergy in Agentic Code Review (Zhong et al., arXiv:2603.15911)](https://arxiv.org/html/2603.15911v1) |
| **Journeys at risk**; verification gap `named-unrun`; `[preexisting]` vs PR-attributable; given/when/then on behavioral blockers | [Ito](https://www.ito.ai/) (execution-based PR review). Methods only — this skill does not build or drive the app. |
| **Overlay law shape** (path glob + flag + want; quote the law under the finding); **PASS veto** when a product / API-shape / irreversible-data choice still needs a person's judgement | [Sourcery](https://docs.sourcery.ai/reviews/review-rules/) review rules + [approval](https://docs.sourcery.ai/reviews/anatomy-of-a-review/) phrasing. Methods only — this skill is not their bot, scanner, or quality score. |
| **`[authz]`** (IDOR / client-only filter / open storage / hardcoded secrets) | [XDA — I keep finding vibe coded apps that leak user data](https://www.xda-developers.com/keep-finding-vibe-coded-apps-leak-user-data/) (Apr 2026); [vietanh.dev — Securing Vibe-Coded Apps](https://www.vietanh.dev/blog/2026-03-12-securing-vibe-coded-apps) (Mar 2026); [anthropics/claude-code-security-review](https://github.com/anthropics/claude-code-security-review) taxonomy (authz / IDOR / hardcoded secrets) |
| **`[slopsquat]`** (new dep unresolved / typosquat) | [vietanh.dev](https://www.vietanh.dev/blog/2026-03-12-securing-vibe-coded-apps) (hallucinated package names); Anthropic security-review taxonomy (supply chain / typosquatting) |
| **`[instruction_injection]`** (hidden operator text in agent config; Advisory until a live path) | vietanh.dev (Pillar Security rules-file backdoor). Distinct from Pass 3 #12 (untrusted user input to a product LLM). |
| **Noise filter** (drop speculative DoS, rate-limit, open-redirect, memory/CPU, unproven validation from `BLOCKERS`) | [anthropics/claude-code-security-review](https://github.com/anthropics/claude-code-security-review) false-positive filter |
| **Throwaway code / piecemeal growth** (Pass 3 names, not new blocker rows) | [Foote & Yoder — Big Ball of Mud](http://www.laputan.org/mud/) (1999) |
