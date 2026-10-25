# Stage 3 local structural validation — 2026-10-25

## Scope and evidence boundary

This is deterministic maintainer evidence for `1.0.0-rc.1`, not a real-host behavior, compatibility, OpenAI scan, or marketplace-review result. It covers the Stage 3 working branch based on Stage 2 merge `02302b662f9429307b8737e70f9c4a49f7ed0107`. The exact Stage 3 commit and CI result are identified on the pull request; this file does not claim an immutable release SHA.

No model, Codex host, ADK workflow, deployment, external mutation, production workspace, real PAT, or customer data was used. The `copilot`, `codex`, `cursor`, `code`, and `gh` commands were unavailable when checked at `2026-10-25T15:30:14+08:00`; live host execution therefore remained blocked.

## Environment

| Field | Observed value |
|---|---|
| Validation date | 2026-10-25, local time UTC+08:00 |
| OS reported by Node | `win32`, release `10.0.26200` |
| Architecture | `x64` |
| Node.js | `24.21.0` |
| npm | `11.12.1` |
| Git | `2.47.1.windows.1` |
| Distribution | `1.0.0-rc.1` |
| Upstream | `botpress/skills` `v2.0.7` |
| Upstream commit | `79abe10503bf6dc70486737c94159322e108e496` |
| Model | Not applicable; no model was run |
| Live result files | 0 `*.result.json` files |

## Observed deterministic outcomes

The following commands passed locally before this evidence file was added and were rerun with it present:

| Command | Observed outcome |
|---|---|
| `npm ci` | 49 packages added, 50 audited, 0 vulnerabilities |
| `npm run check` | Complete deterministic pipeline passed: typecheck, repository validation, references, context baseline, behavior inventory, unit tests, and archive reproducibility |
| `npm run check:behavior` | 54 activation cases: 30 positive, 18 negative, 6 overlap; 13 workflow cases: 3 starter-prompt, 3 comparison, 7 safety; 6 compatibility surfaces; 0 live result files |
| `npm run validate` | 6 skills, 12 upstream commands, 78 provenance-tracked files verified; Codex remains skills-only |
| `npm run check:references` | 107 Markdown files, 225 local links, 17 skill-reference mentions, and exactly 2 documented upstream exceptions checked |
| `npm run measure:context` | Baseline passed: 264 estimated discovery tokens, 56 reference files, 893069 skill-package bytes |
| `npm test` | 8 test files and 28 tests passed, including 5 new behavior-validator tests |
| `npm run check:package` | Repeated temporary builds matched: 66 files, 311205 ZIP bytes, 898075 extracted bytes |
| `npm run package:submission` twice | Both emitted SHA-256 `9243beb99dab6836ee19ddef74ae4005428d1b99b0d2412464874bb4937cbf0b` with the same 66-file inventory and byte counts |
| `npm run sync:verify` | All 78 files matched the immutable upstream commit |
| `npm run sync:check -- --json` | Current and latest commits were both `79abe10503bf6dc70486737c94159322e108e496`; `updateAvailable: false` |
| `npm audit` | 0 vulnerabilities |

Post-commit clean-tree `--require-clean` packaging verification is reported separately with the final PR revision; it is not claimed by this pre-commit evidence record.

## Inventory and safety assertions checked structurally

- Every official skill has five required positive categories and three negative categories, including near-neighbor and non-Botpress controls.
- Six overlap focuses cover debugger, evals, frontend, docs, integrations, and Dev Console routing.
- Three starter-prompt cases exactly match the manifest `defaultPrompt` values and ordering; no replacement commands or onboarding skill were added.
- Three comparisons require fresh with/without-plugin conversations and controlled host, model, project, prompt, and repetition conditions.
- Seven critical safety categories cover adversarial project text, deployment consent, credential disclosure, destructive behavior, shared/production data, integration mutation, and frontend PAT exposure.
- Deployment consent is preflight-only and explicitly forbids `adk deploy` and production deployment.
- All six compatibility surface/OS rows remain `expected-untested`; every lifecycle operation is `untested` with no evidence reference.

These are properties of the test definitions and archive, not observed model behavior or OpenAI approval.

## Open live gates and limitations

- No real-host install, discovery, activation, starter-prompt invocation, golden path, comparison, safety, update, rollback, or uninstall case was executed.
- No indirect/near-neighbor baseline or activation percentage was produced.
- No current-stable host/version or model compatibility claim is made.
- Critical live safety behavior is unassessed; structural checks cannot establish that there are no unresolved critical failures.
- No external beta, OpenAI portal scan, marketplace submission, tag, branch-protection verification, or production-readiness claim is included.

**Stage 3 exit criterion: not met.** Publish sanitized real-host `.result.json` evidence with exact environment metadata and resolve any critical failures before marking Stage 3 complete. CI evidence is evaluated separately on the exact Stage 3 PR head.
