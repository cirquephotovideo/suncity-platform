/**
 * AI media generation — multi-provider façade.
 *
 * Image providers:
 *   - 'gemini'      → Google Gemini 2.5 Flash Image (Nano Banana 2)
 *   - 'higgsfield'  → Higgsfield AI (X-Api-Key-Id/Secret)
 *   - 'picsum'      → free stock photos (no key, fallback)
 *
 * Video providers:
 *   - 'veo'         → Google Veo 3.1 (long-running operation)
 *   - 'higgsfield'  → Higgsfield video API
 *   - 'sample'      → static placeholder MP4 (fallback)
 *
 * Env vars (set in Coolify):
 *   - GEMINI_API_KEY                           → enables 'gemini' + 'veo'
 *   - HIGGSFIELD_API_KEY_ID + _SECRET          → enables 'higgsfield'
 */

export type ImageProvider = 'gemini' | 'higgsfield' | 'picsum';
export type VideoProvider = 'veo' | 'higgsfield' | 'sample';

export type HfModel = 'higgsfield-lite' | 'higgsfield-standard' | 'higgsfield-turbo';
export type HfMotion = 'low' | 'medium' | 'high';

export interface ImageOpts {
  prompt: string;
  count?: number;
  provider?: ImageProvider;
}

export interface VideoOpts {
  prompt: string;
  provider?: VideoProvider;
  // Higgsfield-specific
  model?: HfModel;
  duration?: number;
  motion?: HfMotion;
  loop?: boolean;
  // Veo-specific
  aspectRatio?: '16:9' | '9:16';
}

export interface ImageResult {
  ok: boolean;
  images?: { data: string; mimeType: string }[];
  provider?: ImageProvider;
  error?: string;
}

export interface VideoResult {
  ok: boolean;
  videoUrl?: string;
  provider?: VideoProvider;
  error?: string;
}

const HF_API_BASE = 'https://api.higgsfield.ai/v1';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image-preview'; // Nano Banana 2
const VEO_MODEL = 'veo-3.0-generate-001'; // Veo 3 (most stable; veo-3.1 also accepted)

function hasGemini() { return !!process.env.GEMINI_API_KEY; }
function hasHiggsfield() {
  return !!(process.env.HIGGSFIELD_API_KEY_ID && process.env.HIGGSFIELD_API_KEY_SECRET);
}

async function fetchBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return Buffer.from(buf).toString('base64');
}

// ─── Picsum stub (image) ─────────────────────────────────────────────────────
async function picsumImage(opts: ImageOpts): Promise<ImageResult> {
  const count = opts.count ?? 2;
  const promptHash = Array.from(opts.prompt).reduce(
    (h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0,
    0
  );
  const images: { data: string; mimeType: string }[] = [];
  for (let i = 0; i < count; i++) {
    const seed = Math.abs(promptHash + i * 1009) % 10000;
    try {
      const data = await fetchBase64(`https://picsum.photos/seed/sc${seed}/1280/720`);
      images.push({ data, mimeType: 'image/jpeg' });
    } catch {
      images.push({
        data: 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        mimeType: 'image/gif',
      });
    }
  }
  return { ok: true, images, provider: 'picsum' };
}

// ─── Gemini Nano Banana 2 (image) ────────────────────────────────────────────
async function geminiImage(opts: ImageOpts): Promise<ImageResult> {
  if (!hasGemini()) return { ok: false, error: 'GEMINI_API_KEY non configuré', provider: 'gemini' };
  const count = Math.max(1, Math.min(opts.count ?? 1, 4));
  const url = `${GEMINI_API_BASE}/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const images: { data: string; mimeType: string }[] = [];

  // Gemini image API generates 1 image per call → loop for `count`
  for (let i = 0; i < count; i++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: opts.prompt }] }],
          generationConfig: { responseModalities: ['IMAGE'] },
        }),
      });
      const json = await res.json().catch(() => null) as any;
      if (!res.ok || !json) {
        return { ok: false, error: `Gemini HTTP ${res.status}: ${JSON.stringify(json)}`, provider: 'gemini' };
      }
      const parts = json?.candidates?.[0]?.content?.parts ?? [];
      const imgPart = parts.find((p: any) => p.inlineData?.data);
      if (imgPart) {
        images.push({
          data: imgPart.inlineData.data,
          mimeType: imgPart.inlineData.mimeType ?? 'image/png',
        });
      }
    } catch (e) {
      return { ok: false, error: `Gemini fetch failed: ${e instanceof Error ? e.message : e}`, provider: 'gemini' };
    }
  }
  if (images.length === 0) return { ok: false, error: 'Gemini n\'a retourné aucune image (filtre safety ?)', provider: 'gemini' };
  return { ok: true, images, provider: 'gemini' };
}

// ─── Higgsfield image ────────────────────────────────────────────────────────
async function higgsfieldImage(opts: ImageOpts): Promise<ImageResult> {
  if (!hasHiggsfield()) return { ok: false, error: 'HIGGSFIELD keys non configurées', provider: 'higgsfield' };
  const headers = {
    'Content-Type': 'application/json',
    'X-Api-Key-Id': process.env.HIGGSFIELD_API_KEY_ID!,
    'X-Api-Key-Secret': process.env.HIGGSFIELD_API_KEY_SECRET!,
  };
  const body = JSON.stringify({
    prompt: opts.prompt,
    num_images: opts.count ?? 2,
    aspect_ratio: '16:9',
  });
  const res = await fetch(`${HF_API_BASE}/generate/image`, { method: 'POST', headers, body });
  const json = await res.json().catch(() => null) as any;
  if (!res.ok || !json) {
    return { ok: false, error: `Higgsfield HTTP ${res.status}: ${JSON.stringify(json)}`, provider: 'higgsfield' };
  }
  const images = await Promise.all(
    (json.images ?? []).slice(0, opts.count ?? 2).map(async (img: { url: string }) => ({
      data: await fetchBase64(img.url),
      mimeType: 'image/jpeg',
    }))
  );
  return { ok: true, images, provider: 'higgsfield' };
}

// ─── Veo (video) ─────────────────────────────────────────────────────────────
async function veoVideo(opts: VideoOpts): Promise<VideoResult> {
  if (!hasGemini()) return { ok: false, error: 'GEMINI_API_KEY non configuré', provider: 'veo' };
  const apiKey = process.env.GEMINI_API_KEY!;
  const startUrl = `${GEMINI_API_BASE}/models/${VEO_MODEL}:predictLongRunning?key=${apiKey}`;
  try {
    const start = await fetch(startUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: opts.prompt }],
        parameters: {
          aspectRatio: opts.aspectRatio ?? '16:9',
          durationSeconds: opts.duration ?? 6,
        },
      }),
    });
    const startJson = await start.json().catch(() => null) as any;
    if (!start.ok || !startJson?.name) {
      return { ok: false, error: `Veo start HTTP ${start.status}: ${JSON.stringify(startJson)}`, provider: 'veo' };
    }
    const opName: string = startJson.name; // e.g. "models/veo-3.0-generate-001/operations/abc123"

    // Poll up to ~3 min (Veo typically 1-2 min for 6s clip)
    const pollUrl = `${GEMINI_API_BASE}/${opName}?key=${apiKey}`;
    for (let i = 0; i < 36; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const poll = await fetch(pollUrl);
      const pj = await poll.json().catch(() => null) as any;
      if (pj?.done) {
        const videos = pj?.response?.generatedVideos ?? pj?.response?.predictResponse?.predictions?.[0]?.videos;
        const videoUri = videos?.[0]?.video?.uri ?? videos?.[0]?.uri ?? videos?.[0]?.gcsUri;
        if (!videoUri) return { ok: false, error: `Veo done sans video: ${JSON.stringify(pj).slice(0, 400)}`, provider: 'veo' };
        // The URI is a Google-side URL that requires the API key as query param
        const finalUrl = videoUri.includes('?') ? `${videoUri}&key=${apiKey}` : `${videoUri}?key=${apiKey}`;
        return { ok: true, videoUrl: finalUrl, provider: 'veo' };
      }
      if (pj?.error) {
        return { ok: false, error: `Veo error: ${JSON.stringify(pj.error)}`, provider: 'veo' };
      }
    }
    return { ok: false, error: 'Veo timeout (3 min)', provider: 'veo' };
  } catch (e) {
    return { ok: false, error: `Veo fetch failed: ${e instanceof Error ? e.message : e}`, provider: 'veo' };
  }
}

// ─── Higgsfield video ────────────────────────────────────────────────────────
async function higgsfieldVideo(opts: VideoOpts): Promise<VideoResult> {
  if (!hasHiggsfield()) return { ok: false, error: 'HIGGSFIELD keys non configurées', provider: 'higgsfield' };
  const headers = {
    'Content-Type': 'application/json',
    'X-Api-Key-Id': process.env.HIGGSFIELD_API_KEY_ID!,
    'X-Api-Key-Secret': process.env.HIGGSFIELD_API_KEY_SECRET!,
  };
  const body = JSON.stringify({
    prompt: opts.prompt,
    model: opts.model ?? 'higgsfield-lite',
    duration: opts.duration ?? 5,
    motion_intensity: opts.motion ?? 'medium',
    loop: opts.loop ?? true,
    aspect_ratio: '16:9',
  });
  const res = await fetch(`${HF_API_BASE}/generate/video`, { method: 'POST', headers, body });
  const json = await res.json().catch(() => null) as any;
  if (!res.ok || !json) {
    return { ok: false, error: `Higgsfield HTTP ${res.status}: ${JSON.stringify(json)}`, provider: 'higgsfield' };
  }
  return { ok: true, videoUrl: json.video_url ?? json.url, provider: 'higgsfield' };
}

async function sampleVideo(): Promise<VideoResult> {
  return {
    ok: true,
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    provider: 'sample',
  };
}

// ─── Public dispatch ─────────────────────────────────────────────────────────
export async function generateImage(opts: ImageOpts): Promise<ImageResult> {
  const provider = opts.provider
    ?? (hasGemini() ? 'gemini' : hasHiggsfield() ? 'higgsfield' : 'picsum');
  switch (provider) {
    case 'gemini': return geminiImage(opts);
    case 'higgsfield': return higgsfieldImage(opts);
    case 'picsum': return picsumImage(opts);
  }
}

export async function generateVideo(opts: VideoOpts): Promise<VideoResult> {
  const provider = opts.provider
    ?? (hasGemini() ? 'veo' : hasHiggsfield() ? 'higgsfield' : 'sample');
  switch (provider) {
    case 'veo': return veoVideo(opts);
    case 'higgsfield': return higgsfieldVideo(opts);
    case 'sample': return sampleVideo();
  }
}

// ─── Backwards-compat shims (so existing imports keep working) ───────────────
export const generateHfImage = (o: { prompt: string; count?: number }) => generateImage(o);
export const generateHfVideo = (o: VideoOpts) => generateVideo(o);

export function listAvailableProviders() {
  return {
    image: {
      gemini: hasGemini(),
      higgsfield: hasHiggsfield(),
      picsum: true,
    },
    video: {
      veo: hasGemini(),
      higgsfield: hasHiggsfield(),
      sample: true,
    },
  };
}
