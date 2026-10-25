# Codex starter prompts

**Status:** Curated for `1.0.0-rc.1`; activation and workflow behavior have not been tested in a real host. These prompts do not create replacement slash commands or an onboarding skill.

The three prompts in `plugin.json` at `extensions.com.openai.interface.defaultPrompt` are the authoritative directory-listing prompts. The marked block below is generated-copy documentation, not a second source of truth; deterministic validation requires an exact match.

<!-- codex-default-prompts:start -->
- In this disposable directory, initialize a Botpress ADK project with me and explain account-affecting steps before running them.
- Investigate this sanitized ADK failure using checks, logs, and traces, then propose a targeted fix without deploying.
- Write an official ADK regression eval for this synthetic order-lookup scenario and explain its assertions.
<!-- codex-default-prompts:end -->

## Additional maintainer test prompts

These scenarios remain manual test inputs; they are not extra directory-listing prompts.

- Build: “Read my ADK project and build one order-lookup action. Show the proposed files first and run static validation afterward.”
- Integration: “Search for a Slack integration and report a pinned version and configuration requirements. Stop before any workspace mutation.”
- Frontend: “Add a typed frontend service for this bot action, keeping PATs out of source and logs.”
- Documentation: “Review this guide against the actual ADK primitives and report inaccurate examples without rewriting unrelated sections.”
- Negative control: “Help me center a generic React button.” This should not require Botpress ADK skills unless the project context genuinely makes them relevant.

Stage 3 includes one `starter-prompt-*` case per manifest prompt in `tests/workflows/cases.json`, with exact prompt/order parity enforced by `npm run check:behavior`. Test them against an immutable pushed revision in fresh conversations, record full environment metadata and observed routing in a sanitized `.result.json` file, and refine them only from observed failures. No live result is currently claimed.
