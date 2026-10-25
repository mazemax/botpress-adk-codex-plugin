import { existsSync, lstatSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { loadDistribution, readJson, relativeFile, type DistributionConfig } from './lib/common.js'

const categories = new Set([
  'Productivity', 'Creativity', 'Developer Tools', 'Business & Operations',
  'Data & Analytics', 'Communication', 'Education & Research', 'Security',
  'Finance', 'Healthcare', 'Travel', 'Entertainment', 'Other',
])

const interfaceFields = new Set([
  'displayName', 'shortDescription', 'longDescription', 'developerName', 'category',
  'websiteURL', 'supportURL', 'privacyPolicyURL', 'defaultPrompt', 'brandColor',
  'brandColorDark', 'composerIcon', 'logo',
])

interface OpenAiInterface {
  displayName: string
  shortDescription: string
  longDescription: string
  developerName: string
  category: string
  websiteURL: string
  supportURL: string
  privacyPolicyURL: string
  defaultPrompt: string[]
  brandColor: string
  brandColorDark: string
  composerIcon: string
  logo: string
}

interface OpenAiManifest {
  description: string
  extensions: {
    'com.openai': {
      interface: OpenAiInterface
      publication: { release_notes: string }
    }
  }
}

function requireObject(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`)
  }
  return value as Record<string, unknown>
}

function requireText(value: unknown, label: string, maximum: number, multiline = false): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be non-empty text`)
  if (value.length > maximum) throw new Error(`${label} exceeds ${maximum} characters`)
  if (!multiline && /[\r\n]/.test(value)) throw new Error(`${label} must fit on one line`)
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u2028\u2029\u200B-\u200D\u2060\uFEFF]/u.test(value)) {
    throw new Error(`${label} contains unsupported control or invisible characters`)
  }
  if (!multiline && /[\u0009\u000A\u000D]/u.test(value)) throw new Error(`${label} contains unsupported whitespace`)
  return value
}

function requireHttpsUrl(value: unknown, label: string): string {
  const text = requireText(value, label, 1024)
  let url: URL
  try {
    url = new URL(text)
  } catch {
    throw new Error(`${label} must be a valid HTTPS URL`)
  }
  if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) {
    throw new Error(`${label} must be an HTTPS URL without embedded credentials`)
  }
  return text
}

function channel(hex: string): number {
  const value = Number.parseInt(hex, 16) / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(color: string): number {
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) throw new Error(`Invalid six-digit color: ${color}`)
  return 0.2126 * channel(color.slice(1, 3)) + 0.7152 * channel(color.slice(3, 5)) + 0.0722 * channel(color.slice(5, 7))
}

export function contrastRatio(first: string, second: string): number {
  const a = relativeLuminance(first)
  const b = relativeLuminance(second)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

function validateAsset(root: string, value: unknown, label: string): void {
  const asset = requireText(value, label, 1024)
  if (!asset.startsWith('./') || asset.includes('\\') || asset.split('/').includes('..')) {
    throw new Error(`${label} must be a ./ path inside the plugin`)
  }
  if (!/\.(?:png|jpe?g|webp|svg)$/i.test(asset)) throw new Error(`${label} has an unsupported image extension`)
  const absolute = path.resolve(root, asset.slice(2))
  if (!absolute.startsWith(`${path.resolve(root)}${path.sep}`)) throw new Error(`${label} escapes the plugin root`)
  if (!existsSync(absolute) || !lstatSync(absolute).isFile() || lstatSync(absolute).isSymbolicLink()) {
    throw new Error(`${label} must reference a regular packaged file`)
  }
  if (statSync(absolute).size > 5 * 1024 * 1024) throw new Error(`${label} exceeds 5 MiB`)
  if (!asset.endsWith('.svg')) throw new Error(`${label}: this distribution validates its committed SVG asset only`)

  const svg = readFileSync(absolute, 'utf8')
  if (!/^\s*<svg\b[^>]*>/i.test(svg) || !/<\/svg>\s*$/i.test(svg)) throw new Error(`${label} is not a complete SVG`)
  if (/<script\b|\son[a-z]+\s*=|<foreignObject\b/i.test(svg)) throw new Error(`${label} contains active SVG content`)
  const viewBox = svg.match(/^\s*<svg\b[^>]*\bviewBox="([^"]+)"/i)?.[1]
  if (!viewBox) throw new Error(`${label} must define a numeric viewBox`)
  const dimensions = viewBox.trim().split(/\s+/).map(Number)
  if (dimensions.length !== 4 || dimensions.some((value) => !Number.isFinite(value))) {
    throw new Error(`${label} has invalid viewBox dimensions`)
  }
  const [, , width, height] = dimensions
  if (width < 48 || height < 48 || width > 4096 || height > 4096 || width !== height) {
    throw new Error(`${label} must be square and between 48 and 4096 units`)
  }
}

export function validateStarterPromptDocument(root: string, prompts: string[]): void {
  const document = readFileSync(path.join(root, 'review', 'starter-prompts.md'), 'utf8')
  const block = [
    '<!-- codex-default-prompts:start -->',
    ...prompts.map((prompt) => `- ${prompt}`),
    '<!-- codex-default-prompts:end -->',
  ].join('\n')
  const starts = document.split('<!-- codex-default-prompts:start -->').length - 1
  const ends = document.split('<!-- codex-default-prompts:end -->').length - 1
  if (starts !== 1 || ends !== 1 || !document.includes(block)) {
    throw new Error('review/starter-prompts.md marked prompt block must exactly match plugin.json defaultPrompt')
  }
}

export function validateOpenAiManifest(root: string, value: unknown, distribution: DistributionConfig): string[] {
  const manifest = requireObject(value, 'plugin.json')
  requireText(manifest.description, 'plugin description', 1024, true)
  const extensions = requireObject(manifest.extensions, 'plugin extensions')
  if (Object.keys(extensions).length !== 1 || !extensions['com.openai']) {
    throw new Error('Codex manifest must contain only the com.openai extension')
  }
  const openai = requireObject(extensions['com.openai'], 'com.openai extension')
  const openaiKeys = Object.keys(openai).sort()
  if (JSON.stringify(openaiKeys) !== JSON.stringify(['interface', 'publication'])) {
    throw new Error(`Codex extension must contain only interface and publication: ${openaiKeys.join(', ')}`)
  }
  const listing = requireObject(openai.interface, 'OpenAI interface')
  for (const key of Object.keys(listing)) {
    if (!interfaceFields.has(key)) throw new Error(`Unsupported or out-of-scope OpenAI interface field: ${key}`)
  }
  if (Object.keys(listing).length !== interfaceFields.size) throw new Error('OpenAI interface is missing required curated listing fields')

  requireText(listing.displayName, 'interface.displayName', 30)
  requireText(listing.shortDescription, 'interface.shortDescription', 30)
  requireText(listing.longDescription, 'interface.longDescription', 4000, true)
  requireText(listing.developerName, 'interface.developerName', 80)
  if (listing.developerName !== 'mazemax') throw new Error('interface.developerName must identify mazemax')
  if (!categories.has(listing.category as string)) throw new Error('interface.category is not an OpenAI-supported category')

  if (requireHttpsUrl(listing.websiteURL, 'interface.websiteURL') !== distribution.repository) {
    throw new Error('interface.websiteURL must be the distribution repository')
  }
  if (requireHttpsUrl(listing.supportURL, 'interface.supportURL') !== `${distribution.repository}/issues`) {
    throw new Error('interface.supportURL must be the distribution issue tracker')
  }
  if (requireHttpsUrl(listing.privacyPolicyURL, 'interface.privacyPolicyURL') !== `${distribution.repository}/blob/main/PRIVACY.md`) {
    throw new Error('interface.privacyPolicyURL must identify the committed privacy document')
  }
  if (!existsSync(path.join(root, 'PRIVACY.md'))) throw new Error('PRIVACY.md is required by the listing metadata')

  if (!Array.isArray(listing.defaultPrompt) || listing.defaultPrompt.length < 1 || listing.defaultPrompt.length > 3) {
    throw new Error('interface.defaultPrompt must contain one to three prompts')
  }
  const normalized = new Set<string>()
  for (const [index, prompt] of listing.defaultPrompt.entries()) {
    requireText(prompt, `interface.defaultPrompt[${index}]`, 128)
    if (prompt.includes('@')) throw new Error('Starter prompts must not contain @mentions')
    const key = prompt.normalize('NFKC').trim().replace(/\s+/g, ' ')
    if (normalized.has(key)) throw new Error('Starter prompts must be unique after normalization')
    normalized.add(key)
  }

  if (contrastRatio(requireText(listing.brandColor, 'interface.brandColor', 7), '#FFFFFF') < 2) {
    throw new Error('interface.brandColor must have at least 2:1 contrast against white')
  }
  if (contrastRatio(requireText(listing.brandColorDark, 'interface.brandColorDark', 7), '#212121') < 2) {
    throw new Error('interface.brandColorDark must have at least 2:1 contrast against #212121')
  }
  validateAsset(root, listing.logo, 'interface.logo')
  validateAsset(root, listing.composerIcon, 'interface.composerIcon')

  const publication = requireObject(openai.publication, 'OpenAI publication metadata')
  if (Object.keys(publication).length !== 1 || !publication.release_notes) {
    throw new Error('OpenAI publication metadata must contain only release_notes')
  }
  requireText(publication.release_notes, 'publication.release_notes', 4000, true)
  validateStarterPromptDocument(root, listing.defaultPrompt as string[])
  return listing.defaultPrompt as string[]
}

export function validateCodexMarketplace(root: string, distribution: DistributionConfig, version: string): void {
  const marketplacePath = relativeFile(root, '.agents/plugins/marketplace.json')
  const marketplace = requireObject(readJson<unknown>(marketplacePath), 'Codex marketplace')
  if (Object.keys(marketplace).sort().join(',') !== 'interface,name,plugins') {
    throw new Error('Codex marketplace must contain only name, interface, and plugins')
  }
  requireText(marketplace.name, 'marketplace.name', 80)
  const marketplaceInterface = requireObject(marketplace.interface, 'marketplace.interface')
  if (Object.keys(marketplaceInterface).length !== 1) throw new Error('marketplace.interface must contain only displayName')
  requireText(marketplaceInterface.displayName, 'marketplace.interface.displayName', 80)
  if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length !== 1) {
    throw new Error('Codex marketplace must contain exactly one plugin entry')
  }
  const entry = requireObject(marketplace.plugins[0], 'Codex marketplace plugin')
  if (Object.keys(entry).sort().join(',') !== 'category,name,policy,source') {
    throw new Error('Codex marketplace entry has unexpected fields')
  }
  if (entry.name !== distribution.pluginName) throw new Error('Codex marketplace plugin name does not match plugin.json')
  if (entry.category !== 'Developer Tools') throw new Error('Codex marketplace category must be Developer Tools')
  const source = requireObject(entry.source, 'Codex marketplace source')
  if (Object.keys(source).sort().join(',') !== 'ref,source,url') {
    throw new Error('Repository-root Codex plugin must use a Git URL source with a ref')
  }
  if (source.source !== 'url' || source.url !== `${distribution.repository}.git`) {
    throw new Error('Codex marketplace source must identify this repository root')
  }
  const releaseRef = `v${version}`
  if (source.ref !== 'main' && source.ref !== releaseRef) {
    throw new Error(`Codex marketplace ref must be main for a candidate or ${releaseRef} for a release`)
  }
  if (!version.includes('-') && source.ref !== releaseRef) {
    throw new Error('Stable Codex marketplace entries must use an immutable version tag')
  }
  const policy = requireObject(entry.policy, 'Codex marketplace policy')
  if (Object.keys(policy).length !== 2 || policy.installation !== 'AVAILABLE' || policy.authentication !== 'ON_INSTALL') {
    throw new Error('Codex marketplace policy must be AVAILABLE with ON_INSTALL authentication')
  }
}

export function validateCodexDistribution(root: string, distribution = loadDistribution(root)): { prompts: number } {
  const manifest = readJson<OpenAiManifest>(path.join(root, distribution.manifestPath))
  const prompts = validateOpenAiManifest(root, manifest, distribution)
  const packageJson = readJson<{ version: string }>(path.join(root, 'package.json'))
  validateCodexMarketplace(root, distribution, packageJson.version)
  return { prompts: prompts.length }
}
