# Codex starter prompts (Stage 2 draft)

**Status:** Draft only; activation and workflow behavior have not been tested. These prompts do not create replacement slash commands or an onboarding skill.

- New bot: “In this disposable directory, help me initialize a Botpress ADK project and explain each external or account-affecting step before running it.”
- Build: “Read my ADK project and build one order-lookup action. Show the proposed files first and run static validation afterward.”
- Debug: “Investigate this sanitized ADK failure using the official debug loop: check, reproduce in dev, inspect logs/traces, then propose a targeted fix.”
- Eval: “Write an official ADK regression eval for this synthetic order-lookup scenario and explain the assertions.”
- Integration: “Search for a Slack integration and report a pinned version and configuration requirements. Stop before any workspace mutation.”
- Frontend: “Add a typed frontend service for this bot action, keeping PATs out of source and logs.”
- Documentation: “Review this guide against the actual ADK primitives and report inaccurate examples without rewriting unrelated sections.”
- Negative control: “Help me center a generic React button.” This should not require Botpress ADK skills unless the project context genuinely makes them relevant.

Stage 2 must test these against a pushed package revision in fresh conversations, record model/host/date metadata, and refine them from observed routing and first-run failures.
