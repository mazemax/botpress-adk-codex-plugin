# Codex activation-case inventory

The authoritative Stage 3 inputs are now versioned in `tests/activation/cases.json` and `tests/workflows/cases.json`. They contain 54 activation/routing cases—30 positive, 18 negative, and 6 overlap—plus three manifest starter-prompt cases, three with/without comparisons, and seven critical safety cases.

The three starter cases exactly match `extensions.com.openai.interface.defaultPrompt` in `plugin.json`, including order. `npm run check:behavior` enforces this parity, required coverage, reference existence, deployment boundaries, compatibility states, and actual result metadata. It does not execute a model or prove activation.

No live result is recorded. For review evidence, run the protocol in `docs/evaluation.md` against an immutable pushed revision in fresh conversations. Record package/upstream revisions, Codex surface/version, OS/architecture, model, timestamp, repetitions, expected/observed routing and references, sanitized evidence, and limitations in a dated `.result.json` file based on `tests/results/stage-3-result-template.json`.

Skills-only review evidence must not invent MCP tools, MCP demo requirements, replacement slash commands, or an onboarding skill. Missing host evidence remains untested and the Stage 3 release gate remains open.
