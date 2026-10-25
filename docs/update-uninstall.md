# Update, rollback, duplicate installs, and uninstall

Back up any host configuration you change and record the current package version, install source, and upstream SHA. Update one host at a time and verify in a fresh session. None of the host operations below has been observed with this package; they are verification procedures derived from official OpenAI documentation.

## Codex marketplace operations

Inspect configured catalogs and their resolved roots:

```bash
codex plugin marketplace list
```

Refresh the pre-release catalog when intentionally tracking the moving candidate:

```bash
codex plugin marketplace upgrade mazemax-botpress-adk
```

The plugin entry also points its repository-root Git source at `main`; a catalog upgrade is therefore not an immutable release selector. Record the resolved plugin version and source after refreshing, restart the host, and use a fresh conversation. If the host retains a cached plugin copy, follow its observed reinstall/refresh behavior rather than assuming the catalog update changed it.

To remove the catalog source, use:

```bash
codex plugin marketplace remove mazemax-botpress-adk
```

First disable or uninstall **Botpress ADK Community** through the host's plugin surface, then remove the marketplace and restart. Record any remaining plugin cache, enabled-setting, or configuration residue. Repository tooling never edits global Codex configuration or uninstalls host components automatically.

## Rollback

Do not use the moving `main` candidate as a rollback point. Use a previously tested immutable version whose marketplace entry selects `v<version>`, then reinstall through the verified host flow, restart/reload, and repeat discovery plus the golden path. Compare both `UPSTREAM.json` files and review side-effect differences so rollback does not silently change the upstream ADK snapshot.

The immutable-tag selection and real rollback flow remain release-blocking tests. Universal-directory installation/removal will be documented only after an approved public listing exists.

## Duplicate installations

Use one intentional installation source per host profile where practical. Inspect personal, project, and plugin skill directories for duplicate names and remove stale copies. Check for `botpress-adk-community@mazemax-botpress-adk` in plugin settings. Record precedence/cache behavior from actual host evidence instead of guessing.

## Verification after update or removal

Confirm package version, expected six-skill inventory (or absence after removal), fresh-conversation activation, and any remaining host configuration/cache entries. Update `docs/compatibility.md` only with observed results. The distribution's own scripts never modify host installation or global configuration.
