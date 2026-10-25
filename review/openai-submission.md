# OpenAI submission checklist

**Status:** Not submitted. No submission ZIP, review ID, or public-directory listing exists.

Stage 2 must add and test the pre-release repository marketplace, curated starter prompts, neutral listing assets, publisher/support/privacy URLs, and a reproducible skills-only ZIP from an immutable tag. Verify the archive inventory, reproducibility, checksums, and absence of commands, hooks, MCP definitions, symlinks, secrets, telemetry, and unapproved files.

Use the [OpenAI plugin submission process](https://developers.openai.com/plugins/deploy/submission) with `mazemax`'s verified developer identity. Keep OpenAI-specific metadata in root `plugin.json` under `extensions.com.openai`; do not maintain a conflicting `.codex-plugin/plugin.json` or add a new onboarding skill.

For a skills-only package, official documentation permits omitting MCP configuration and MCP review cases. Provide high-quality skill activation evidence voluntarily where useful; do not fabricate MCP tools, an MCP demo, or review results. Upload only after production gates pass, resolve automated/human findings, and verify the universal directory listing after approval.
