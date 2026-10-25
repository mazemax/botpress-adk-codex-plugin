import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { unzipSync, zipSync, type Zippable } from 'fflate'
import { listFiles, loadUpstream, readJson, relativeFile, sha256File } from './lib/common.js'
import { validateRepository } from './validate.js'

const MAX_ARCHIVE_BYTES = 100_000_000
const MAX_EXTRACTED_BYTES = 512 * 1024 * 1024
const MAX_MEMBER_BYTES = 100 * 1024 * 1024
const MAX_ENTRIES = 5000
const FIXED_LOCAL_MTIME = new Date(1980, 0, 1, 0, 0, 0, 0)

export interface SubmissionEntry {
  path: string
  contents: Uint8Array
  sha256: string
}

export interface SubmissionResult {
  archivePath: string
  checksumPath: string
  inventoryPath: string
  archiveSha256: string
  archiveBytes: number
  extractedBytes: number
  fileCount: number
}

function sha256Bytes(contents: Uint8Array): string {
  return createHash('sha256').update(contents).digest('hex')
}

export function assertSafeArchivePath(value: string): void {
  if (!value || value.trim() !== value || value.includes('\\') || value.startsWith('/')) {
    throw new Error(`Unsafe archive path: ${JSON.stringify(value)}`)
  }
  if (/^[A-Za-z]:/.test(value) || /[\u0000-\u001F\u007F]/.test(value) || value.length > 240) {
    throw new Error(`Unsafe archive path: ${JSON.stringify(value)}`)
  }
  const segments = value.split('/')
  if (segments.length > 20 || segments.some((segment) => !segment || segment === '.' || segment === '..')) {
    throw new Error(`Unsafe archive path: ${value}`)
  }
  if (['mcp.json', '.mcp.json', '.app.json', '.env'].includes(value) || value.startsWith('.env.')) {
    throw new Error(`Forbidden submission component: ${value}`)
  }
  if (segments.some((segment) => ['commands', 'hooks', 'agents', '.codex-plugin', '.claude-plugin', 'com.github.copilot'].includes(segment))) {
    throw new Error(`Forbidden submission component: ${value}`)
  }
}

export function collectSubmissionEntries(root: string): SubmissionEntry[] {
  const upstream = loadUpstream(root)
  const expectedSkills = Object.keys(upstream.files).filter((file) => file.startsWith('skills/')).sort()
  const actualSkills = listFiles(path.join(root, 'skills')).map((file) => `skills/${file}`).sort()
  if (!expectedSkills.length || JSON.stringify(actualSkills) !== JSON.stringify(expectedSkills)) {
    throw new Error('Submission skills must exactly match the provenance inventory; unapproved skill files are not allowed')
  }

  const files = ['plugin.json', 'LICENSE', 'NOTICE.md', 'assets/logo.svg', ...expectedSkills].sort()
  const entries = files.map((relativePath) => {
    assertSafeArchivePath(relativePath)
    const absolute = relativeFile(root, relativePath)
    if (!existsSync(absolute)) throw new Error(`Submission file is missing: ${relativePath}`)
    const stat = lstatSync(absolute)
    if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`Submission file must be a regular non-symlink file: ${relativePath}`)
    const contents = readFileSync(absolute)
    if (contents.byteLength > MAX_MEMBER_BYTES) throw new Error(`Submission file exceeds 100 MiB: ${relativePath}`)
    if (relativePath === 'LICENSE' && sha256File(absolute) !== upstream.licenseSha256) {
      throw new Error('Submission license differs from the pinned upstream license')
    }
    return { path: relativePath, contents, sha256: sha256Bytes(contents) }
  })

  const collisions = new Set<string>()
  for (const entry of entries) {
    const normalized = entry.path.normalize('NFC').toLowerCase()
    if (collisions.has(normalized)) throw new Error(`Archive path collision: ${entry.path}`)
    collisions.add(normalized)
  }
  if (!entries.some((entry) => entry.path === 'plugin.json')) throw new Error('Submission must have one plugin root at archive root')
  if (entries.length > MAX_ENTRIES) throw new Error(`Submission exceeds ${MAX_ENTRIES} entries`)
  const extractedBytes = entries.reduce((sum, entry) => sum + entry.contents.byteLength, 0)
  if (extractedBytes > MAX_EXTRACTED_BYTES) throw new Error('Submission exceeds 512 MiB extracted')
  return entries
}

export function createSubmissionArchive(entries: SubmissionEntry[]): Uint8Array {
  const zippable: Zippable = {}
  for (const entry of [...entries].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0)) {
    assertSafeArchivePath(entry.path)
    zippable[entry.path] = [entry.contents, {
      level: 9,
      mtime: FIXED_LOCAL_MTIME,
      os: 0,
      attrs: 0,
    }]
  }
  const archive = zipSync(zippable, { level: 9 })
  if (archive.byteLength > MAX_ARCHIVE_BYTES) throw new Error('Submission ZIP exceeds 100 MB')
  return archive
}

export function verifySubmissionArchive(archive: Uint8Array, expectedEntries: SubmissionEntry[]): void {
  const unzipped = unzipSync(archive)
  const actualPaths = Object.keys(unzipped).sort()
  const expectedPaths = expectedEntries.map((entry) => entry.path).sort()
  if (JSON.stringify(actualPaths) !== JSON.stringify(expectedPaths)) {
    throw new Error(`Archive inventory mismatch: ${actualPaths.join(', ')}`)
  }
  for (const entry of expectedEntries) {
    assertSafeArchivePath(entry.path)
    const actual = unzipped[entry.path]
    if (!actual || sha256Bytes(actual) !== entry.sha256 || actual.byteLength !== entry.contents.byteLength) {
      throw new Error(`Archive content mismatch: ${entry.path}`)
    }
  }
  if (!unzipped['plugin.json']) throw new Error('Archive root plugin.json is missing')
}

export function buildSubmission(root: string, outputDirectory: string): SubmissionResult {
  const entries = collectSubmissionEntries(root)
  const first = createSubmissionArchive(entries)
  const second = createSubmissionArchive(entries)
  const firstHash = sha256Bytes(first)
  const secondHash = sha256Bytes(second)
  if (firstHash !== secondHash || !Buffer.from(first).equals(Buffer.from(second))) {
    throw new Error('Two submission builds were not byte-for-byte reproducible')
  }
  verifySubmissionArchive(first, entries)

  const manifest = readJson<{ name: string; version: string }>(path.join(root, 'plugin.json'))
  const upstream = loadUpstream(root)
  const baseName = `${manifest.name}-${manifest.version}-codex`
  const archiveName = `${baseName}-submission.zip`
  mkdirSync(outputDirectory, { recursive: true })
  const archivePath = path.join(outputDirectory, archiveName)
  const checksumPath = path.join(outputDirectory, `${archiveName}.sha256`)
  const inventoryPath = path.join(outputDirectory, `${baseName}-inventory.json`)
  writeFileSync(archivePath, first)
  writeFileSync(checksumPath, `${firstHash}  ${archiveName}\n`, 'utf8')
  const extractedBytes = entries.reduce((sum, entry) => sum + entry.contents.byteLength, 0)
  const inventory = {
    formatVersion: 1,
    plugin: manifest.name,
    version: manifest.version,
    upstreamRepository: upstream.repository,
    upstreamCommit: upstream.commit,
    archive: {
      fileName: archiveName,
      sha256: firstHash,
      sizeBytes: first.byteLength,
      extractedBytes,
      fileCount: entries.length,
      reproducibleDoubleBuild: true,
      fixedTimestamp: '1980-01-01 00:00:00 (ZIP local time)',
    },
    files: entries.map((entry) => ({
      path: entry.path,
      sha256: entry.sha256,
      sizeBytes: entry.contents.byteLength,
    })),
  }
  writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, 'utf8')
  return {
    archivePath,
    checksumPath,
    inventoryPath,
    archiveSha256: firstHash,
    archiveBytes: first.byteLength,
    extractedBytes,
    fileCount: entries.length,
  }
}

function requireCleanWorkingTree(root: string): void {
  const status = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' })
  if (status.trim()) throw new Error('Release package requires a clean working tree')
}

function requireVersionTag(root: string, version: string): void {
  const tag = `v${version}`
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
  let tagged: string
  try {
    tagged = execFileSync('git', ['rev-parse', `${tag}^{commit}`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    throw new Error(`Release package requires tag ${tag} at HEAD`)
  }
  if (tagged !== head) throw new Error(`Release package requires tag ${tag} at HEAD`)
}

function main(): void {
  const args = new Set(process.argv.slice(2))
  const allowed = new Set(['--check', '--require-clean', '--require-tag'])
  for (const arg of args) if (!allowed.has(arg)) throw new Error(`Unknown package option: ${arg}`)
  const root = process.cwd()
  if (args.has('--require-clean') || args.has('--require-tag')) requireCleanWorkingTree(root)
  validateRepository(root)
  const version = readJson<{ version: string }>(path.join(root, 'package.json')).version
  if (args.has('--require-tag')) requireVersionTag(root, version)

  const temporary = args.has('--check') ? mkdtempSync(path.join(root, '.test-tmp-package-')) : null
  const outputDirectory = temporary ?? path.join(root, 'dist')
  try {
    const result = buildSubmission(root, outputDirectory)
    console.log([
      `Submission package verified: ${result.fileCount} files, ${result.archiveBytes} ZIP bytes, ${result.extractedBytes} extracted bytes.`,
      `SHA-256: ${result.archiveSha256}`,
      temporary ? 'Reproducibility check passed; temporary candidate removed.' : `Archive: ${result.archivePath}`,
    ].join('\n'))
  } finally {
    if (temporary) rmSync(temporary, { recursive: true, force: true })
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    main()
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
