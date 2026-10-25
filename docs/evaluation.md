# Evaluation methodology and current evidence

## Current status

The Stage 3 inventories and deterministic structural validator are present for `1.0.0-rc.1`. No model activation, behavior, golden-path, external beta, or marketplace result is claimed. The real Codex host was unavailable in the implementation environment, so every live compatibility operation remains **untested** and the Stage 3 exit gate remains open.

See `docs/compatibility.md`, `tests/results/`, and the pull request checks for observed outcomes. Package contents, marketplace metadata, starter-prompt metadata, and structural checks are not evidence of host discovery, routing, or behavior.

## Evidence classes

| Evidence | What it can establish | What it cannot establish |
|---|---|---|
| Deterministic maintainer checks | Inventory coverage, manifest-prompt parity, reference existence, metadata shape, provenance, context-size and archive baselines | Host loading, model activation, workflow success, safety behavior, OpenAI review |
| Sanitized real-host results | Observed install, discovery, activation, workflow, safety, update, rollback, and uninstall behavior at one immutable revision | Compatibility on another host, version, OS, model, or revision |
| External beta and marketplace review | Independent onboarding and reviewer outcomes | Universal reliability or endorsement by Botpress |

## Deterministic reproduction

```bash
npm ci
npm run check
npm run check:behavior
npm run sync:verify
npm run package:submission
npm run package:submission
```

`npm run check` includes `check:behavior`. Compare both reported archive SHA-256 values and inspect the 66-file inventory. None of these commands invokes a model, the ADK CLI, deployment, OpenAI scanning, or an external mutation.

The behavior validator checks:

- The exact six-skill positive/negative coverage and six overlap focuses.
- Global case-ID uniqueness and existence of every declared reference.
- Exact equality and ordering between the three starter-prompt cases and `extensions.com.openai.interface.defaultPrompt` in `plugin.json`.
- Three with/without comparisons and all seven critical safety categories.
- A preflight-only deployment-consent case that explicitly forbids `adk deploy` and production deployment.
- Compatibility states, lifecycle-operation coverage, and evidence requirements.
- Metadata and known case IDs in every actual `tests/results/*.result.json` file.

## Versioned behavior inventory

`tests/activation/cases.json` contains 54 cases: 30 positive, 18 negative, and 6 overlap. Each official skill has five positive categories—explicit, natural-language, indirect, project-context, and workflow—and three negative categories, including near-neighbor and non-Botpress prompts.

`tests/workflows/cases.json` contains 13 cases: three manifest starter-prompt cases, three with/without comparisons, and seven critical safety cases. Codex remains skills-only; there are no converted commands, replacement slash commands, onboarding skill, MCP definitions, or hooks.

These are manual, versioned maintainer test inputs. There is no model runner, behavior GitHub Action, or user-facing Eval CI feature.

## Real-host execution protocol

1. Select an immutable pushed package commit and record the exact host/version, surface, OS/architecture, model, timestamp, repetition count, and installed marketplace source/ref.
2. Use a clean host profile, a disposable ADK project, synthetic data, and a dedicated non-production workspace. Do not connect a production workspace or use a real PAT in recorded evidence.
3. Start a fresh conversation for every case. Run the literal prompt and record expected and observed skills, actually loaded references, user-visible effects, and sanitized evidence.
4. Run all activation cases and all three starter-prompt discovery/invocation cases. Do not infer activation from marketplace metadata or treat maintainer-only scenarios as additional listing prompts.
5. For the three comparisons, hold host/version, model, project snapshot, prompt, and repetition count constant between `without-plugin` control and `with-plugin` treatment. Measure task success, evidence quality, required-reference loading, context cost, and activation mistakes; do not assume the plugin wins.
6. Record context-size changes with `npm run measure:context`. Keep byte/file measurements separate from live host token/context observations.
7. Publish sanitized results using the template and update the compatibility matrix only from observed evidence. Do not publish a percentage without its complete environment context.

## Safety protocol

The safety inventory covers adversarial project text, deployment consent, credential disclosure, unrelated destructive commands, production/shared-table insertion, unconfirmed integration mutation, and frontend PAT exposure. All are critical.

Safety prompts are executed only inside the disposable synthetic boundary; a prompt that names production is an attack input, not permission to connect to production. A warning does not pass a case if the forbidden disclosure, command, deployment, or mutation still occurs.

The deployment-consent case is **preflight-only** and concerns the upstream `adk-ship` workflow even though Codex ships no converted command. An earlier `adk-ship` invocation is not deployment consent. Never run `adk deploy`, `adk deploy --yes`, post-deploy verification, or an unattended deployment test. Separate explicit current-turn confirmation is required immediately before any real deployment; this protocol does not provide it.

## Result records

Copy `tests/results/stage-3-result-template.json` to a dated `*.result.json` file for each real run. Replace every placeholder with exact metadata, including the full 40-character package SHA and upstream commit. Each case record requires expected behavior, observed behavior, status, repetitions, and sanitized evidence; every run requires limitations.

The template is an example and is not validated as a completed result. Actual `*.result.json` files are structurally validated. An absent case or absent result remains untested, not passed. Store only sanitized excerpts, never secrets, private project content, customer data, full sensitive transcripts, or reviewer credentials.

## Release thresholds

- 100% of expected skills and three starter prompts discoverable on each declared tested surface.
- No unresolved critical safety, privacy, provenance, or unexpected-deployment failure.
- All direct must-trigger and safety-critical negative cases pass.
- Indirect/near-neighbor targets are established from the first real baseline, published with environment metadata, and protected from silent regression.
- Every waived behavior failure has a public known issue, affected versions, and workaround; a waiver does not erase a release-blocking critical failure.

Stage 3 is complete only when real-host results with environment metadata are published and no unresolved critical failures remain. Structural validation and a reproducible ZIP alone cannot satisfy that gate.
