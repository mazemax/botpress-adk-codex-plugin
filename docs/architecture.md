# Architecture and change boundaries

## Layers

1. **Canonical upstream content** — `botpress/skills` at `v2.0.7`, commit `79abe10503bf6dc70486737c94159322e108e496`.
2. **Managed snapshot** — verbatim `skills/`, read-only source commands in `upstream/commands/`, upstream metadata in `upstream/`, and the original `LICENSE`.
3. **Codex distribution** — portable root `plugin.json`, OpenAI metadata under `extensions.com.openai`, and automatic discovery of root `skills/`.
4. **Pre-release catalog** — `.agents/plugins/marketplace.json` with one repository-root Git source. Its `main` ref is explicitly a moving candidate source; stable versions require a version tag.
5. **Community operations** — documentation, neutral artwork, validation, tests, reproducible packaging, and release/support processes.

`UPSTREAM.json` maps every managed local file to its upstream path and SHA-256 hash. `distribution.json` describes only this host distribution; it is not a host manifest extension. No `.codex-plugin/plugin.json` overlay is maintained.

## Why commands are under `upstream/`

The pinned repository contains 12 official Claude Code commands. They are retained as source evidence, not loaded as Codex components, because Claude-specific command syntax is not assumed to be portable. Codex remains skills-only; the shared command generator is used only as a safeguard that rejects a Codex `commands/` tree and generates nothing.

## Validation boundaries

- `validate.ts` checks the portable manifest, package inventory, frontmatter, attribution, forbidden component types, workflow action pins, and recorded hashes.
- `validate-codex.ts` checks final OpenAI listing limits, curated-prompt/document consistency, publisher URLs, square SVG assets, brand contrast, marketplace shape, and immutable-tag policy for stable versions.
- `check-references.ts` resolves local Markdown links and `references/*.md` mentions in each `SKILL.md`.
- `measure-context.ts` measures discovery descriptions and full skill/reference sizes. Token figures are explicitly rough estimates, not provider tokenization.
- `sync-upstream.ts --verify` fetches the exact upstream commit and compares bytes without running upstream code.
- Unit tests exercise only community maintainer tooling with temporary local fixtures.

These are deterministic repository checks, not OpenAI portal scans or real-host behavior evidence. Publisher-URL reachability and verified identity require separate observed checks.

## Submission package boundary

`package-submission.ts` selects only `plugin.json`, `LICENSE`, `NOTICE.md`, `assets/logo.svg`, and the exact provenance-tracked `skills/` tree. The archive root is the plugin root. Maintainers' tests, CI, commands, documentation, MCP/apps, hooks, agents, screenshots, telemetry, environment files, and symlinks are not included.

The builder sorts entries, fixes ZIP timestamps and attributes, reads the archive back, compares every path and SHA-256 hash, and builds twice to require identical bytes. It emits the ZIP, checksum, and inventory under ignored `dist/`. Local builds may contain working-tree changes; release builds require a clean tree and `v${version}` at `HEAD`.

## Sync and release

The scheduled sync checks the public `master` branch, applies a candidate only to a review branch, runs checks, and opens a pull request. It never auto-merges. A human must review the upstream diff and side-effect implications.

Tag releases run validation and publish both a source snapshot and the validated skills-only submission ZIP with checksums and inventory. Publishing those artifacts is not OpenAI submission, approval, or a production-readiness claim.
