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
    },
  })
}

/** Strips markdown code fences, kept for defense-in-depth even with JSON mode on. */
export function cleanJsonText(text: string): string {
  return text.replace(/```json|```/g, '').trim()
}