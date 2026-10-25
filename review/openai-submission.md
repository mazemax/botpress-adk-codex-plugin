# OpenAI submission runbook

**Status:** Not submitted. A local candidate ZIP, checksum, and inventory can be generated under ignored `dist/`; there is no OpenAI review ID or public-directory listing. A local or CI artifact is not a submission result.

## Implemented candidate

- Portable root `plugin.json` with OpenAI listing metadata under `extensions.com.openai.interface` and release notes under `publication.release_notes`.
- Three curated prompts, publisher/support/privacy URLs, `Developer Tools` category, brand colors, and square `logo`/`composerIcon` SVG assets.
- `.agents/plugins/marketplace.json` for a separate pre-release repository marketplace. Its `main` Git ref is a moving candidate source, not the immutable public-submission gate.
- A skills-only ZIP containing exactly `plugin.json`, `LICENSE`, `NOTICE.md`, `assets/logo.svg`, and the provenance-tracked `skills/` files at the archive root.

The package deliberately has no commands, hooks, agents, MCP/apps configuration, onboarding skill, telemetry, screenshots, or fabricated review cases. Skills-only submissions must not include `interface.screenshots`; screenshots belong to MCP custom UI, not this package.

## Reproduce and inspect

```bash
npm ci
npm run check
npm run sync:verify
npm run package:submission
npm run package:submission
```

Require identical SHA-256 values across both builds and inspect `dist/*-inventory.json`. `npm run check` also runs a temporary package/reproducibility check. The builder reads the ZIP back and compares every archived path and file hash, but this does not replace OpenAI's automated scans.

For a release artifact, use an immutable tagged revision after all applicable gates pass:

```bash
npm run package:submission -- --require-clean --require-tag
```

The command requires a clean working tree and `v<version>` at `HEAD`. The tag-release workflow publishes the source snapshot, submission ZIP, checksums, and inventory as GitHub release artifacts; that is still not OpenAI approval.

## Official submission gate

1. Complete real-host behavior, safety, compatibility, external-beta, and release-review gates. Do not submit the moving `main` candidate as production evidence.
2. Confirm publisher URLs are reachable and identify `mazemax`; complete OpenAI individual or business verification and select the matching developer identity.
3. In the official plugin portal, choose **Upload new or existing plugin** and the **Skills only** route, then upload the immutable tagged submission ZIP.
4. Wait for metadata and every skill scan, copy any findings back into the maintainer workflow, correct the source package, and upload a newly validated version as required.
5. Complete required policy attestations and submit only when required checks are clear. Track the actual review ID and communicate reviewer feedback without representing submission as approval.
6. After approval, choose publication deliberately and verify the universal directory listing and a clean public installation.

Use the [OpenAI plugin submission process](https://developers.openai.com/plugins/deploy/submission). For this skills-only package, do not fabricate MCP tools, MCP review cases, reviewer credentials, or an MCP demo. Provide real skill activation and safety evidence when available; untested items remain untested.
