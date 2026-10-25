# Troubleshooting

Start with `docs/compatibility.md`: an unverified host configuration is not a known-good installation.

## Marketplace or plugin does not appear

**Possible causes:** The catalog is not present on the intended revision, the repository-root Git source cannot be resolved, the host cached an older copy, or the host surface does not support this package mode.

**Action:** Run `codex plugin marketplace list`, confirm `mazemax-botpress-adk` and its resolved root, and inspect the actual catalog entry. Confirm the installed plugin contains root `plugin.json` and `skills/`. Refresh/reinstall from the intended source, restart the host, and inspect the installed plugin list. Record the exact host version and source; do not call the moving `main` candidate an immutable release.

## Skills are missing or the wrong skill activates

**Possible causes:** Duplicate personal/project/plugin skills with the same `name`, stale session state, an overly broad prompt, or a host discovery defect.

**Action:** Inventory other installed copies, remove duplicates, start a fresh conversation, and use the activation issue template with the prompt, expected skill, actual skill, host/model/version, and package SHA. For curated prompts, compare against `review/starter-prompts.md`. Do not include private transcripts.

## A skill cannot find `references/*.md`

**Possible causes:** An incomplete copy, a symlink/source layout the host does not support, or packaging that omitted reference files.

**Action:** Verify the installed tree contains the reference under the same skill directory. Run `npm run check:references` and `npm run check:package` in the source repository. The package inventory provides expected per-file hashes. Reinstall using real directories, not an unsupported external symlink.

## Commands are unavailable

Codex intentionally ships skills only. The 12 files under `upstream/commands/` are source evidence, not installed host commands. Use natural-language workflows or the curated starter prompts; do not invent `/adk-*` replacements or add an onboarding skill.

## Submission package validation fails

Run `npm run check:package` for a temporary reproducibility check or `npm run package:submission` to inspect ignored `dist/` artifacts. Compare the reported inventory and SHA-256, and confirm no unapproved file was added under `skills/`. `--require-clean` rejects working-tree changes; `--require-tag` additionally requires `v<version>` at `HEAD`. A passing local archive check is not an OpenAI portal scan or review result.

## ADK CLI is missing, outdated, or not authenticated

The plugin packages skills, not the ADK CLI or a Botpress account. Verify `adk --version`, follow official Botpress setup guidance, and check the intended workspace before retrying. Do not paste a PAT or `BOTPRESS_TOKEN` into an issue.

## Validation reports a provenance mismatch

Do not edit `skills/` or `upstream/` to make the error disappear. Restore the pinned files or prepare a reviewed upstream sync. `npm run sync:verify` compares against the immutable upstream commit.

## Update leaves stale behavior

Refresh the plugin source, reinstall where the host caches direct installs, restart/reload, and start a new conversation. Record both the old and new package/upstream revisions. See `docs/update-uninstall.md`.

## A workflow requests deployment or workspace mutation

Stop and inspect the target workspace, command, and side-effect matrix. `adk-ship` is production deployment, not a build check. Unattended repository tests must never deploy or mutate a real user workspace.
