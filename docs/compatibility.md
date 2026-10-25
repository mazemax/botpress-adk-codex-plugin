# Compatibility evidence

## Tested real-host configurations

**None for `1.0.0-rc.1`.** No clean-host installation, discovery, activation, workflow, update, rollback, or uninstall result is claimed. Repository structure, marketplace metadata, and reproducible ZIP checks are not host compatibility evidence, and the Stage 3 compatibility gate remains open.

The machine-readable source is `tests/compatibility/matrix.json`. It currently contains six `expected-untested` surface/OS rows and no `tested` rows.

## Support-state meanings

| State | Meaning |
|---|---|
| `tested` | Every lifecycle operation has observed evidence at the recorded host/version, OS/architecture, model, package SHA, and upstream revision. Failed or blocked operations remain visible; `tested` does not mean every operation passed. |
| `expected-untested` | Official documentation makes this a candidate surface, but this package has no observed result there. Every operation remains `untested`. |
| `not-claimed` | No support or parity is claimed. This state is reserved for surfaces outside the declared package scope. |

A host, version, OS, or model must not be promoted to `tested` from documentation, marketplace metadata, a successful structural test, a reproducible archive, or evidence from another surface.

## Candidate support matrix

| Host surface | Host version | OS targets | Current evidence |
|---|---|---|---|
| Codex CLI | Unrecorded | Windows/macOS/Linux | `expected-untested`; CLI unavailable during implementation |
| Codex in ChatGPT desktop | Unrecorded | Windows/macOS/Linux targets | `expected-untested`; host unavailable during implementation |

These are candidate targets, not a support promise. The current stable host version must be tested before a production compatibility claim; earlier versions may be added only after actual testing.

## Lifecycle evidence required

Every matrix row separates `install`, `discovery`, `activation`, `workflow`, `update`, `rollback`, and `uninstall`. A `tested` row requires a status and existing sanitized evidence reference for every operation. No single smoke test may fill the whole row.

For every real run, record:

- Distribution `1.0.0-rc.1` and full immutable package commit SHA.
- Upstream `v2.0.7` and `79abe10503bf6dc70486737c94159322e108e496`.
- Exact host/version and surface, OS/version/architecture, model, timestamp, and repetitions.
- Marketplace/plugin source/ref, expected and observed behavior, sanitized evidence, and limitations.

Use `tests/results/stage-3-result-template.json` for case-level records. Structural validation rejects placeholder metadata, unknown surfaces or case IDs, and tested rows without evidence. It does not judge whether an observed behavior is correct or make a failed row compatible.

## Current limitations

- Six skills and three curated prompts are present, but real-host discovery and activation are unverified.
- The repository marketplace currently selects the moving `main` source for pre-release testing; stable releases require an immutable version tag.
- Codex ships no converted commands or onboarding skill; the 12 source commands remain under `upstream/commands/`.
- The local skills-only ZIP has deterministic inventory/reproducibility checks, but no OpenAI portal validation, human review, or public listing result.
- All 54 activation/routing cases, three starter-prompt cases, three comparisons, and seven safety cases await real-host execution.
- No current-stable host matrix, golden path, update/rollback/uninstall result, or external Botpress developer beta has been completed.
- Actual ADK CLI prompts, generated files, network calls, and workspace effects remain live-verification items; see `docs/side-effects.md`.

## Known upstream reference issues

The pinned upstream contains two broken relative Markdown links. They are preserved verbatim and tracked in `tests/reference-exceptions.json`; any additional or stale exception fails `npm run check:references`.

- `skills/adk-frontend/references/authentication.md`: `../tables.md` does not resolve; the available guide is `skills/adk/references/tables.md`.
- `skills/adk-frontend/references/calling-actions.md`: `../actions.md` does not resolve; the available guide is `skills/adk/references/actions.md`.

These are documentation-link findings, not evidence that the related ADK workflows are broken. Report content concerns through the upstream-content issue template rather than silently patching managed files.

## Deterministic evidence

Maintainer commands and their observed outcomes are reported in dated files under `tests/results/` and in pull request checks. `npm run check:behavior` validates the inventory and evidence shape only. The candidate archive contains 66 regular files and is built twice for byte-for-byte comparison. GitHub Actions results must be evaluated at the exact revision being released; no deterministic result fills a real-host or marketplace-review gate.
