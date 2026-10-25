# Update, rollback, duplicate installs, and uninstall

Back up any host configuration you change and record the current package version, install source, and upstream SHA. Update one host at a time and verify in a fresh session.

## Codex

The Stage 2 repository-marketplace entry will define the supported source-install flow. Official documentation describes `codex plugin marketplace list`, `codex plugin marketplace upgrade`, and `codex plugin marketplace remove`, plus per-repo enable/disable configuration and host restart behavior. These commands have not been tested against this package in Stage 1.

Do not edit global Codex configuration from this repository's tooling. Once the source flow is verified, documentation will identify the exact marketplace name, cache/restart steps, rollback source, and removal residue. Universal-directory installation/removal will be documented only after approval.

## Rollback

Use a previously tested immutable tag/commit rather than an arbitrary branch tip. Reinstall or select that source using the verified host flow, restart/reload, and repeat discovery plus the golden path. A rollback must not silently change the upstream ADK snapshot: compare both `UPSTREAM.json` files and review side-effect differences.

## Duplicate installations

Use one intentional installation source per host profile where practical. Inspect personal, project, and plugin skill directories for duplicate names and remove stale copies. Record precedence/cache behavior from actual host evidence instead of guessing.

## Verification after update or removal

Confirm package version, expected six-skill inventory (or absence after removal), fresh-conversation activation, and any remaining host configuration/cache entries. Update `docs/compatibility.md` only with observed results. The distribution's own scripts never modify host installation or global configuration.
