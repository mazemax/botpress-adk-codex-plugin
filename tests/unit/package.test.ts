import { afterEach, describe, expect, it } from 'vitest'
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { unzipSync } from 'fflate'
import { sha256File, writeJson, type UpstreamManifest } from '../../scripts/lib/common.js'
import {
  assertSafeArchivePath,
  buildSubmission,
  collectSubmissionEntries,
  createSubmissionArchive,
  verifySubmissionArchive,
} from '../../scripts/package-submission.js'

const temporaryDirectories: string[] = []

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true })
})

function fixture(): string {
  const root = mkdtempSync(path.join(process.cwd(), '.test-tmp-'))
  temporaryDirectories.push(root)
  mkdirSync(path.join(root, 'skills', 'adk'), { recursive: true })
  mkdirSync(path.join(root, 'assets'), { recursive: true })
  writeFileSync(path.join(root, 'plugin.json'), '{"name":"fixture-plugin","version":"1.0.0-rc.1"}\n')
  writeFileSync(path.join(root, 'LICENSE'), 'MIT fixture license\n')
  writeFileSync(path.join(root, 'NOTICE.md'), 'Upstream attribution\n')
  writeFileSync(path.join(root, 'assets', 'logo.svg'), '<svg viewBox="0 0 48 48"></svg>\n')
  writeFileSync(path.join(root, 'skills', 'adk', 'SKILL.md'), '---\nname: adk\n---\nBuild\n')
  const upstream: UpstreamManifest = {
    repository: 'https://github.com/botpress/skills',
    sourceBranch: 'master',
    tag: 'v2.0.7',
    commit: '79abe10503bf6dc70486737c94159322e108e496',
    upstreamPluginVersion: '2.0.7',
    distributionVersion: '1.0.0-rc.1',
    syncedAt: '2026-10-25T00:00:00.000Z',
    skillInventory: ['adk'],
    commandInventory: [],
    skillFileCount: 1,
    commandFileCount: 0,
    licenseSha256: sha256File(path.join(root, 'LICENSE')),
    files: {
      'skills/adk/SKILL.md': {
        upstreamPath: 'skills/adk/SKILL.md',
        sha256: sha256File(path.join(root, 'skills', 'adk', 'SKILL.md')),
      },
    },
  }
  writeJson(path.join(root, 'UPSTREAM.json'), upstream)
  return root
}

describe('Codex submission package', () => {
  it('uses an exact allowlist and excludes maintainer and forbidden root files', () => {
    const root = fixture()
    writeFileSync(path.join(root, 'package.json'), '{"private":true}\n')
    writeFileSync(path.join(root, '.env'), 'SECRET=not-packaged\n')
    writeFileSync(path.join(root, 'mcp.json'), '{}\n')
    mkdirSync(path.join(root, 'commands'), { recursive: true })
    writeFileSync(path.join(root, 'commands', 'adk-build.md'), 'not packaged\n')

    const entries = collectSubmissionEntries(root)
    expect(entries.map((entry) => entry.path)).toEqual([
      'LICENSE',
      'NOTICE.md',
      'assets/logo.svg',
      'plugin.json',
      'skills/adk/SKILL.md',
    ])
    const archive = createSubmissionArchive(entries)
    verifySubmissionArchive(archive, entries)
    expect(Object.keys(unzipSync(archive))).not.toContain('mcp.json')
    expect(Object.keys(unzipSync(archive))).not.toContain('.env')
    expect(Object.keys(unzipSync(archive))).not.toContain('package.json')
  })

  it('rejects unapproved skill files and symbolic links', () => {
    const extra = fixture()
    writeFileSync(path.join(extra, 'skills', 'adk', 'unexpected.md'), 'not approved\n')
    expect(() => collectSubmissionEntries(extra)).toThrow(/unapproved skill files/)

    const linked = fixture()
    symlinkSync(path.join(linked, 'skills', 'adk'), path.join(linked, 'skills', 'linked'), process.platform === 'win32' ? 'junction' : 'dir')
    expect(() => collectSubmissionEntries(linked)).toThrow(/Symbolic links are not allowed/)
  })

  it('produces identical archives and inventories across independent builds', () => {
    const root = fixture()
    const first = buildSubmission(root, path.join(root, 'dist-first'))
    const second = buildSubmission(root, path.join(root, 'dist-second'))
    expect(first.fileCount).toBe(5)
    expect(first.archiveSha256).toBe(second.archiveSha256)
    expect(readFileSync(first.archivePath).equals(readFileSync(second.archivePath))).toBe(true)
    expect(readFileSync(first.inventoryPath).equals(readFileSync(second.inventoryPath))).toBe(true)
    expect(readFileSync(first.checksumPath, 'utf8')).toContain(first.archiveSha256)
  })

  it('rejects unsafe paths and out-of-scope package components', () => {
    for (const value of ['../secret', '/absolute', 'C:/secret', 'skills\\adk\\SKILL.md', 'mcp.json', '.env.local', 'hooks/run.js', 'skills/adk/agents/openai.yaml']) {
      expect(() => assertSafeArchivePath(value)).toThrow()
    }
  })
})
