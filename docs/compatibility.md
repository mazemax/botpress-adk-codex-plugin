# Compatibility evidence

## Tested real-host configurations

**None yet for `1.0.0-rc.1`.** No clean-host installation, activation, workflow, update, rollback, or uninstall result is claimed. Repository structure, marketplace metadata, and reproducible ZIP checks are not host compatibility evidence.

## Candidate support matrix

| Host surface | Host version | OS target | Current evidence |
|---|---|---|---|
| Codex CLI | Version not recorded | Windows/macOS/Linux | Marketplace CLI flow is documented by OpenAI; **untested** — CLI unavailable during implementation |
| Codex in ChatGPT desktop | Version not recorded | Supported desktop platforms | Local/repository marketplace flow is documented by OpenAI; **untested** — host unavailable during implementation |

“Documented” means the official format documentation describes the surface; it does not mean this package passed there. Add a version to the tested matrix only after recording actual evidence.

## Evidence to record

For every tested row, capture host/version, OS/architecture, distribution `1.0.0-rc.1`, upstream `v2.0.7` / `79abe10503bf6dc70486737c94159322e108e496`, model, date, marketplace/plugin source SHA, and separate results for install, discovery, activation, golden path, update, rollback, and uninstall.

## Current limitations

- Six skills and three curated prompts are present, but real-host discovery and activation are unverified.
- The repository marketplace currently selects the moving `main` source for pre-release testing; stable releases require an immutable version tag.
- Codex ships no converted commands or onboarding skill; the 12 source commands remain under `upstream/commands/`.
- The local skills-only ZIP has deterministic inventory/reproducibility checks, but no OpenAI portal validation, human review, or public listing result.
- No external Botpress developer beta has been completed.
- Actual ADK CLI prompts, generated files, network calls, and workspace effects remain live-verification items; see `docs/side-effects.md`.

## Known upstream reference issues

The pinned upstream contains two broken relative Markdown links. They are preserved verbatim and tracked in `tests/reference-exceptions.json`; any additional or stale exception fails `npm run check:references`.

- `skills/adk-frontend/references/authentication.md`: `../tables.md` does not resolve; the available guide is `skills/adk/references/tables.md`.
- `skills/adk-frontend/references/calling-actions.md`: `../actions.md` does not resolve; the available guide is `skills/adk/references/actions.md`.

These are documentation-link findings, not evidence that the related ADK workflows are broken. Report content concerns through the upstream-content issue template rather than silently patching managed files.

## Deterministic evidence

Maintainer commands and their observed outcomes are reported in the implementation pull request and dated files under `tests/results/`. The current candidate archive contains 66 regular files and is built twice for byte-for-byte comparison. GitHub Actions results must be evaluated at the exact revision being released; no deterministic result fills a real-host or marketplace-review gate.
