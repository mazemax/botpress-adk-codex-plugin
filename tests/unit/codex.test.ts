import { describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { loadDistribution, readJson, writeJson } from '../../scripts/lib/common.js'
import {
  contrastRatio,
  validateCodexDistribution,
  validateCodexMarketplace,
  validateOpenAiManifest,
  validateStarterPromptDocument,
} from '../../scripts/validate-codex.js'

const root = process.cwd()
const distribution = loadDistribution(root)

function manifest(): Record<string, unknown> {
  return structuredClone(readJson<Record<string, unknown>>(path.join(root, 'plugin.json')))
}

function openAi(value: Record<string, unknown>): Record<string, unknown> {
  const extensions = value.extensions as Record<string, unknown>
  return extensions['com.openai'] as Record<string, unknown>
}

describe('Codex listing and marketplace', () => {
  it('accepts the committed final-submission metadata and marketplace', () => {
    expect(validateCodexDistribution(root).prompts).toBe(3)
    expect(contrastRatio('#0369A1', '#FFFFFF')).toBeGreaterThanOrEqual(2)
    expect(contrastRatio('#7DD3FC', '#212121')).toBeGreaterThanOrEqual(2)
  })

  it('enforces final listing and starter-prompt limits', () => {
    const value = manifest()
    const listing = openAi(value).interface as Record<string, unknown>
    listing.shortDescription = 'x'.repeat(31)
    expect(() => validateOpenAiManifest(root, value, distribution)).toThrow(/shortDescription exceeds 30/)

    const prompts = manifest()
    const promptListing = openAi(prompts).interface as Record<string, unknown>
    promptListing.defaultPrompt = ['x'.repeat(129)]
    expect(() => validateOpenAiManifest(root, prompts, distribution)).toThrow(/defaultPrompt\[0\] exceeds 128/)
  })

  it('rejects duplicate prompts and out-of-scope OpenAI components', () => {
    const duplicate = manifest()
    const listing = openAi(duplicate).interface as Record<string, unknown>
    listing.defaultPrompt = ['Same prompt', ' Same  prompt ']
    expect(() => validateOpenAiManifest(root, duplicate, distribution)).toThrow(/unique after normalization/)

    const onboarding = manifest()
    openAi(onboarding).onboardingSkill = './skills/adk/SKILL.md'
    expect(() => validateOpenAiManifest(root, onboarding, distribution)).toThrow(/only interface and publication/)

    const screenshots = manifest()
    ;(openAi(screenshots).interface as Record<string, unknown>).screenshots = ['./assets/logo.svg']
    expect(() => validateOpenAiManifest(root, screenshots, distribution)).toThrow(/out-of-scope.*screenshots/)
  })

  it('requires an immutable marketplace ref for a stable version', () => {
    const temporary = mkdtempSync(path.join(root, '.test-tmp-'))
    try {
      const marketplace = readJson<unknown>(path.join(root, '.agents', 'plugins', 'marketplace.json'))
      writeJson(path.join(temporary, '.agents', 'plugins', 'marketplace.json'), marketplace)
      expect(() => validateCodexMarketplace(temporary, distribution, '1.0.0')).toThrow(/immutable version tag/)
    } finally {
      rmSync(temporary, { recursive: true, force: true })
    }
  })

  it('detects drift between the prompt document and manifest', () => {
    const temporary = mkdtempSync(path.join(root, '.test-tmp-'))
    try {
      mkdirSync(path.join(temporary, 'review'), { recursive: true })
      const document = readFileSync(path.join(root, 'review', 'starter-prompts.md'), 'utf8')
      writeFileSync(path.join(temporary, 'review', 'starter-prompts.md'), document.replace('<!-- codex-default-prompts:end -->', '- Extra prompt\n<!-- codex-default-prompts:end -->'))
      const prompts = (openAi(manifest()).interface as { defaultPrompt: string[] }).defaultPrompt
      expect(() => validateStarterPromptDocument(temporary, prompts)).toThrow(/exactly match/)
    } finally {
      rmSync(temporary, { recursive: true, force: true })
    }
  })
})
