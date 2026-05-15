import { prisma } from '@/lib/prisma';

export interface AiResult {
  ok: boolean;
  text: string;
  error?: string;
}

interface GenerateOpts {
  maxTokens?: number;
}

// ── Stub implementations ──────────────────────────────────

async function geminiGenerateText(prompt: string, _opts?: GenerateOpts): Promise<AiResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: false, error: 'no_key', text: 'Stub: configure GEMINI_API_KEY in environment.' };
  // TODO: call Google Gemini API
  return { ok: true, text: `[Gemini stub] ${prompt.slice(0, 80)}…` };
}

async function geminiGenerateImage(prompt: string, _opts?: GenerateOpts): Promise<AiResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: false, error: 'no_key', text: 'Stub: configure GEMINI_API_KEY in environment.' };
  // TODO: call Imagen via Vertex AI
  return { ok: true, text: `[Gemini image stub] prompt="${prompt.slice(0, 80)}"` };
}

async function openaiGenerateText(prompt: string, _opts?: GenerateOpts): Promise<AiResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { ok: false, error: 'no_key', text: 'Stub: configure OPENAI_API_KEY in environment.' };
  // TODO: call OpenAI chat completions
  return { ok: true, text: `[OpenAI stub] ${prompt.slice(0, 80)}…` };
}

async function openaiGenerateImage(prompt: string, _opts?: GenerateOpts): Promise<AiResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { ok: false, error: 'no_key', text: 'Stub: configure OPENAI_API_KEY in environment.' };
  // TODO: call DALL-E 3
  return { ok: true, text: `[OpenAI DALL-E stub] prompt="${prompt.slice(0, 80)}"` };
}

async function anthropicGenerateText(prompt: string, _opts?: GenerateOpts): Promise<AiResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { ok: false, error: 'no_key', text: 'Stub: configure ANTHROPIC_API_KEY in environment.' };
  // TODO: call Anthropic Messages API
  return { ok: true, text: `[Anthropic stub] ${prompt.slice(0, 80)}…` };
}

async function anthropicGenerateImage(_prompt: string, _opts?: GenerateOpts): Promise<AiResult> {
  return { ok: false, error: 'unsupported', text: 'Anthropic does not support image generation.' };
}

// ── Locale-aware translate stub ───────────────────────────

async function geminiTranslate(text: string, from: string, to: string): Promise<AiResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: false, error: 'no_key', text: 'Stub: configure GEMINI_API_KEY in environment.' };
  const prompt = `Translate the following text from ${from} to ${to}. Return only the translated text.\n\n${text}`;
  return geminiGenerateText(prompt);
}

async function openaiTranslate(text: string, from: string, to: string): Promise<AiResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { ok: false, error: 'no_key', text: 'Stub: configure OPENAI_API_KEY in environment.' };
  const prompt = `Translate the following text from ${from} to ${to}. Return only the translated text.\n\n${text}`;
  return openaiGenerateText(prompt);
}

async function anthropicTranslate(text: string, from: string, to: string): Promise<AiResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { ok: false, error: 'no_key', text: 'Stub: configure ANTHROPIC_API_KEY in environment.' };
  const prompt = `Translate the following text from ${from} to ${to}. Return only the translated text.\n\n${text}`;
  return anthropicGenerateText(prompt);
}

// ── Active provider resolution ────────────────────────────

export type ProviderKey = 'GEMINI' | 'OPENAI' | 'ANTHROPIC';

export async function getActiveProvider(): Promise<ProviderKey> {
  try {
    const setting = await prisma.aiSetting.findUnique({ where: { id: 1 } });
    return (setting?.defaultProvider as ProviderKey) ?? 'GEMINI';
  } catch {
    return 'GEMINI';
  }
}

export async function generateText(prompt: string, opts?: GenerateOpts): Promise<AiResult> {
  const provider = await getActiveProvider();
  switch (provider) {
    case 'OPENAI':    return openaiGenerateText(prompt, opts);
    case 'ANTHROPIC': return anthropicGenerateText(prompt, opts);
    default:          return geminiGenerateText(prompt, opts);
  }
}

export async function generateImage(prompt: string, opts?: GenerateOpts): Promise<AiResult> {
  const provider = await getActiveProvider();
  switch (provider) {
    case 'OPENAI':    return openaiGenerateImage(prompt, opts);
    case 'ANTHROPIC': return anthropicGenerateImage(prompt, opts);
    default:          return geminiGenerateImage(prompt, opts);
  }
}

export async function translate(text: string, fromLocale: string, toLocale: string): Promise<AiResult> {
  const provider = await getActiveProvider();
  switch (provider) {
    case 'OPENAI':    return openaiTranslate(text, fromLocale, toLocale);
    case 'ANTHROPIC': return anthropicTranslate(text, fromLocale, toLocale);
    default:          return geminiTranslate(text, fromLocale, toLocale);
  }
}
