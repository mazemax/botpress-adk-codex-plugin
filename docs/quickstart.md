# Codex quickstart

**Release candidate:** `1.0.0-rc.1`. The repository marketplace and package checks are implemented, but this installation and discovery protocol has **not been run in a real Codex host**. Commands below follow official OpenAI documentation; they are not observed compatibility results. See `docs/compatibility.md`.

## Prerequisites

- A supported OpenAI Codex installation and account/configuration for that product.
- Git for source-based marketplace access.
- For ADK workflows: the official Botpress ADK CLI, a compatible ADK environment, and a dedicated non-production Botpress workspace when a live dev bot is required.
- A disposable ADK project directory and synthetic data.
- Node.js 24+ only for maintainer tooling; it is not a plugin runtime dependency.

Read `docs/side-effects.md` before invoking workflows. No Botpress token is needed for repository validation.

## Pre-release repository marketplace

After this revision reaches `main`, add the catalog and inspect the resolved source:

```bash
codex plugin marketplace add mazemax/botpress-adk-codex-plugin --ref main
codex plugin marketplace list
```

In the supported ChatGPT desktop plugin surface, open **Plugins Directory**, select **mazemax Botpress ADK**, and install **Botpress ADK Community**. Restart the desktop app after changing the local plugin, then start a fresh conversation. If the host asks whether to enable the repository plugin, its identifier is `botpress-adk-community@mazemax-botpress-adk`.

The marketplace entry points to the repository-root Git source at `main`. This is a moving pre-release source, not an immutable production installation. A stable release must use an immutable version tag and pass the release gates before these instructions can be presented as verified.

Do not treat a parsed manifest, a cloned directory, or a successfully built ZIP as an installed plugin. The repository marketplace is separate from the universal public directory; no public-directory submission or approval has occurred.

## Five-minute discovery verification

1. Use a clean host profile and record the exact marketplace and plugin revisions.
2. Restart/reload and start a fresh conversation.
3. Confirm the six skills are discoverable: `adk`, `adk-debugger`, `adk-dev-console`, `adk-docs`, `adk-evals`, and `adk-frontend`.
4. Confirm no replacement commands or onboarding skill were added, and check for duplicate personal/project/plugin skills with the same names.
5. Use a read-oriented prompt first: “Explain what a Botpress ADK action is and show one small example from the official ADK references.”
6. Try the three curated prompts in `review/starter-prompts.md` one at a time in fresh conversations; record actual routing rather than assuming it.
7. Record host/version, OS, model, package version, upstream SHA, expected result, and actual result in the host checklist.

Do not begin with `adk-ship`, credentials, a production workspace, or a destructive test.

## First disposable ADK workflow

After discovery succeeds, use `docs/workflows.md` and the manual checklist to inspect or initialize a disposable project, build one small primitive, validate it, and run a synthetic dev-only test. Review every proposed file and workspace mutation. Do not deploy.

## Maintainer package verification

```bash
npm ci
npm run check
npm run sync:verify
npm run package:submission
```

The last command writes a candidate ZIP, checksum, and inventory under ignored `dist/`. This validates packaging only; it does not install the plugin or submit it to OpenAI.

## If verification fails

Use `docs/troubleshooting.md` and open the appropriate issue template with sanitized evidence. An installation or activation failure should be recorded as a release-blocking finding for the declared support matrix, not silently omitted.
