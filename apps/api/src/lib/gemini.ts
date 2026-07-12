import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GOOGLE_API_KEY) {
  console.warn('⚠️  GOOGLE_API_KEY is not set — Gemini-powered features will fail.')
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

 // Flash tier — fast/cheap, used across all PawSense AI features.
 // gemini-2.5-flash was prematurely retired by Google on 2026-07-09
 // (ahead of its stated Oct 16 2026 shutdown) — migrated to the 3.x tier.
 // Verify this is still the current model string against Google's docs
 // before deploying — model names get deprecated/renamed periodically.
 export const GEMINI_MODEL = 'gemini-3.5-flash'
 
/**
 * Returns a Gemini model configured for structured JSON output, mirroring
 * the "raw JSON object only" prompting pattern the Anthropic controllers used.
 * Pass the same system/instruction prompt you'd have passed as `system` before.
 */
export function getGeminiModel(systemInstruction?: string) {
  return genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    ...(systemInstruction ? { systemInstruction } : {}),
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 16384,
    },
  })
}

/** Strips markdown code fences, kept for defense-in-depth even with JSON mode on. */
export function cleanJsonText(text: string): string {
  return text.replace(/```json|```/g, '').trim()
}

/**
 * Throws a clear error if Gemini's response was cut off due to hitting
 * maxOutputTokens, instead of letting the caller hit a confusing JSON.parse
 * SyntaxError further down the line.
 */
export function assertNotTruncated(result: { response: { candidates?: Array<{ finishReason?: string }> } }) {
  const finishReason = result.response.candidates?.[0]?.finishReason
  if (finishReason === 'MAX_TOKENS') {
    throw new Error('GEMINI_TRUNCATED: response was cut off at the output token limit')
  }
}
/**
 * Human-readable reasons Gemini can fail to return usable content even on a
 * "successful" (non-throwing) API call — safety blocks, recitation blocks,
 * and truncation from hitting the token limit all leave result.response.text()
 * empty or partial, which previously surfaced only as a confusing
 * "Unexpected end of JSON input" error from JSON.parse().
 */
const FINISH_REASON_MESSAGES: Record<string, string> = {
  SAFETY: "The response was blocked by Gemini's safety filters. Try rephrasing with less graphic language.",
  RECITATION: 'The response was blocked due to a recitation/citation concern.',
  MAX_TOKENS: 'The response was cut off before completing — it exceeded the output token limit.',
  OTHER: 'Gemini stopped generating for an unspecified reason.',
}

export class GeminiResponseError extends Error {
  constructor(message: string, public readonly reason: string) {
    super(message)
    this.name = 'GeminiResponseError'
  }
}

/**
 * Safely extracts and parses JSON from a Gemini generateContent() result.
 * Use this instead of calling JSON.parse(cleanJsonText(result.response.text()))
 * directly — it surfaces WHY a response is empty/malformed (safety block,
 * truncation, etc.) instead of letting JSON.parse throw an opaque error.
 */
export function extractGeminiJson<T = unknown>(result: {
  response: {
    text: () => string
    promptFeedback?: { blockReason?: string } | null
    candidates?: Array<{ finishReason?: string }> | null
  }
}): T {
  const { response } = result

  if (response.promptFeedback?.blockReason) {
    throw new GeminiResponseError(
      `Gemini blocked the prompt (${response.promptFeedback.blockReason}). Try rephrasing.`,
      response.promptFeedback.blockReason
    )
  }

  const finishReason = response.candidates?.[0]?.finishReason
  if (finishReason && finishReason !== 'STOP') {
    const message = FINISH_REASON_MESSAGES[finishReason] ?? `Gemini stopped early (${finishReason}).`
    throw new GeminiResponseError(message, finishReason)
  }

  const raw = response.text()
  if (!raw || !raw.trim()) {
    throw new GeminiResponseError('Gemini returned an empty response.', 'EMPTY_RESPONSE')
  }

  try {
    return JSON.parse(cleanJsonText(raw)) as T
  } catch {
    console.error('Gemini returned non-JSON text (first 500 chars):', raw.slice(0, 500))
    throw new GeminiResponseError('Gemini returned malformed JSON.', 'PARSE_ERROR')
  }
}