# Stage 2 validation evidence — 25 October 2026

## Environment and scope

Repository: `mazemax/botpress-adk-codex-plugin`. Maintainer tooling ran on Windows in Git Bash with Node.js `24.21.0`, npm `11.12.1`, and Git `2.47.1.windows.1`. The environment timestamp was `2026-10-25T14:42:16+08:00`. These are repository/tooling results, not real-host compatibility or OpenAI review results.

Verification sequence:

```bash
npm ci
npm run check
npm run sync:verify
npm run sync:check -- --json
npm run package:submission
npm run package:submission
npm audit
```

## Observed outcomes

| Check | Result |
|---|---|
| Clean dependency installation | Passed with `npm ci` |
| Dependency audit | `npm audit` reported 0 vulnerabilities |
| TypeScript type checking | Passed |
| Manifest, OpenAI metadata, marketplace, component, inventory, and provenance validation | Passed: 6 skills, 12 audited upstream commands, 78 provenance-tracked files; Codex remains skills-only |
| Local reference integrity | Passed with this evidence file present: 106 Markdown files, 225 local links, 17 skill-reference mentions, 2 documented upstream exceptions |
| Context baseline | Passed: 264 estimated discovery tokens, 56 reference files, 893069 skill-package bytes; token count is a rough estimate, not provider tokenization |
| Unit tests | Passed: 7 test files, 23 tests |
| Temporary package/reproducibility check | Passed: 66 files, 311205 ZIP bytes, 898075 extracted bytes |
| Repeated submission builds | Both builds produced identical SHA-256 `9243beb99dab6836ee19ddef74ae4005428d1b99b0d2412464874bb4937cbf0b` |
| Archive read-back and inventory | Passed: exactly 66 regular files comprising `plugin.json`, `LICENSE`, `NOTICE.md`, `assets/logo.svg`, and 62 provenance-tracked skill files |
| Pinned upstream verification | Passed: all 78 files match `79abe10503bf6dc70486737c94159322e108e496` |
| Upstream update check | `updateAvailable: false` when observed on 25 October 2026; current and latest commits were identical |

The two reference exceptions preserve genuine broken relative links in upstream `v2.0.7`: `skills/adk-frontend/references/authentication.md` targets `../tables.md`, and `skills/adk-frontend/references/calling-actions.md` targets `../actions.md`. They are documented in `docs/compatibility.md` and pinned in `tests/reference-exceptions.json`; new or stale exceptions fail the check.

## Not tested or performed

The `codex` executable was unavailable when checked. No Codex installation, repository-marketplace installation, six-skill discovery, curated-prompt behavior, model activation, golden path, update, rollback, duplicate-install, or uninstall test was run. Repository metadata and archive checks do not establish host compatibility.

No ADK CLI workflow or live Botpress workspace was invoked. No OpenAI portal scan, publisher-URL availability check, publisher verification, human review, public-directory listing, external beta, production deployment, or marketplace approval occurred. No tag or submission was created, and `--require-tag` was not used. GitHub Actions and branch protection must be evaluated at the exact pushed revision; this local evidence does not record them as passed.
