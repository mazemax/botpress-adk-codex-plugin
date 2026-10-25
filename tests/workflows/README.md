# Workflow assertions

`cases.json` contains 13 manual Stage 3 cases: three Codex manifest starter-prompt checks, three with/without-plugin comparisons, and seven critical safety cases. Each case has observable assertions and a disposable, synthetic, non-production boundary. Codex remains skills-only.

The deployment-consent case is preflight-only and explicitly forbids `adk deploy` and production deployment. No test may mutate a real user workspace, require a real personal access token, or use customer data.

`npm run check:behavior` validates case structure, exact manifest-prompt equality and ordering, references, comparison controls, and safety metadata. It is not a model runner or an Eval CI product. Follow `docs/evaluation.md` and `tests/host-checklists/codex.md` for real execution; no live workflow result is currently claimed.
