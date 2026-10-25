# Botpress ADK Community for OpenAI Codex

**Community-maintained by [mazemax](https://github.com/mazemax); not endorsed by Botpress.**

A production-oriented community distribution of the official [Botpress ADK skills](https://github.com/botpress/skills) for OpenAI Codex, with immutable provenance, explicit side-effect guidance, curated starter prompts, reproducible packaging, and honest compatibility evidence.

**Current status:** `1.0.0-rc.1` release candidate. The repository marketplace, OpenAI listing metadata, and skills-only submission packaging are implemented. Clean Codex installation, model behavior, external beta, and marketplace review are not verified. Do not interpret the manifest, archive checks, or static tests as production readiness or OpenAI approval.

## Included official content

Upstream `v2.0.7` at commit `79abe10503bf6dc70486737c94159322e108e496` provides six skills and 62 skill-tree files:

| Skill | Developer workflow |
|---|---|
| `adk` | ADK architecture, primitives, integrations, configuration, build/init/validate/test guidance |
| `adk-debugger` | Logs, traces, systematic diagnosis, and regression-guided debugging |
| `adk-dev-console` | Dev Console pages, Agent Steps, traces, and multi-agent UI concepts |
| `adk-docs` | Create, review, update, synchronize, and search project documentation |
| `adk-evals` | Official ADK eval format, assertions, and live-dev testing guidance |
| `adk-frontend` | Botpress frontend authentication, typed clients, action calls, and state patterns |

The pinned source also contains 12 official Claude Code commands under `upstream/commands/` for audit. They are not installed as Codex commands. Codex remains skills-only and uses three curated starter prompts for new-bot, debugging, and official-eval workflows.

## Install and first success

Follow [the Codex quickstart](docs/quickstart.md), then use the [workflow guide](docs/workflows.md) and [real-host checklist](tests/host-checklists/codex.md). The quickstart describes the pre-release repository-marketplace flow derived from official OpenAI documentation; it has not passed on a real host. The universal public directory has no listing for this plugin.

Start with a read-oriented ADK question in a fresh session. For project work, use a disposable ADK directory, synthetic data, and a dedicated non-production workspace.

## Submission package

`npm run package:submission` builds an ignored local candidate under `dist/`. The explicit allowlist contains `plugin.json`, `LICENSE`, `NOTICE.md`, the square SVG, and the exact pinned skill tree—66 regular files for this revision. The build reads the ZIP back, verifies every file, repeats the build, and emits a SHA-256 checksum and inventory. It excludes maintainer tooling, commands, MCP/apps, hooks, agents, telemetry, screenshots, and secrets files.

A local candidate is not submission-ready. Release packaging additionally requires a clean working tree and `v1.0.0-rc.1` at `HEAD`; human review, immutable-tag CI, real-host evidence, verified publisher identity, and OpenAI review remain separate gates. See [the submission runbook](review/openai-submission.md).

## What this plugin does not do

- It is not an official Botpress product, support channel, or endorsement.
- It does not bundle the ADK CLI, a Botpress account, an MCP server, agents, hooks, a doctor, or a new Eval CI product.
- It does not rewrite or replace the official ADK knowledge base.
- It does not make production deployment safe or automatic. `adk-ship` requires deliberate review and separate explicit confirmation.
- It does not claim untested hosts, models, operating systems, activation rates, or marketplace approval.

## Safety and privacy

Review the [side-effect inventory](docs/side-effects.md): official workflows can write files, execute commands, access linked workspaces, mutate dev/prod dependencies, insert test data, or deploy. This distribution adds no telemetry or remote maintainer service; see [privacy and data handling](PRIVACY.md).

## Maintenance and trust

- [Exact upstream provenance](review/provenance.md) and machine-readable `UPSTREAM.json`
- [Compatibility and untested configurations](docs/compatibility.md)
- [Evaluation methodology](docs/evaluation.md) and [context baseline](tests/results/context-baseline.json)
- [Curated prompts](review/starter-prompts.md) and [submission checklist](review/openai-submission.md)
- [Update, rollback, duplicate-install, and uninstall guidance](docs/update-uninstall.md)
- [Troubleshooting](docs/troubleshooting.md), [support](SUPPORT.md), and [security reporting](SECURITY.md)
- [Changelog](CHANGELOG.md), [roadmap](ROADMAP.md), and [release gates](review/release-checklist.md)

## License and attribution

The upstream MIT `LICENSE`, including `Copyright (c) 2026 Botpress`, is preserved verbatim. See [NOTICE.md](NOTICE.md) for upstream attribution and community packaging ownership. The neutral logo is original community artwork.
