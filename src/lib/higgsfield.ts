/**
 * Higgsfield AI stub — multi-provider façade.
 * If HIGGSFIELD_API_KEY_ID + HIGGSFIELD_API_KEY_SECRET are set, calls the real API.
 * Otherwise returns a deterministic stub image from Unsplash for development.
 */

export type HfModel = 'higgsfield-lite' | 'higgsfield-standard' | 'higgsfield-turbo';
export type HfMotion = 'low' | 'medium' | 'high';

export interface HfImageOpts {
  prompt: string;
  count?: number;
}

export interface HfVideoOpts {
  prompt: string;
  model?: HfModel;
  duration?: number;
  motion?: HfMotion;
  loop?: boolean;
}

export interface HfImageResult {
  ok: boolean;
  /** base-64 encoded image data, one per requested image */
  images?: { data: string; mimeType: string }[];
  error?: string;
}

export interface HfVideoResult {
  ok: boolean;
  /** URL to the generated video (may be a stub placeholder) */
  videoUrl?: string;
  error?: string;
}

const API_BASE = 'https://api.higgsfield.ai/v1';

function hasKeys() {
  return !!(process.env.HIGGSFIELD_API_KEY_ID && process.env.HIGGSFIELD_API_KEY_SECRET);
}

async function fetchBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return Buffer.from(buf).toString('base64');
}

// ── Real Higgsfield call (image) ──────────────────────────────────────────────
async function realGenerateImage(opts: HfImageOpts): Promise<HfImageResult> {
  const headers = {
    'Content-Type': 'application/json',
    'X-Api-Key-Id': process.env.HIGGSFIELD_API_KEY_ID!,
    'X-Api-Key-Secret': process.env.HIGGSFIELD_API_KEY_SECRET!,
  };
  const body = JSON.stringify({ prompt: opts.prompt, num_images: opts.count ?? 2, aspect_ratio: '16:9' });
  const res = await fetch(`${API_BASE}/generate/image`, { method: 'POST', headers, body });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json) return { ok: false, error: `Higgsfield HTTP ${res.status}: ${JSON.stringify(json)}` };
  // Higgsfield returns { images: [ { url } ] }
  const images = await Promise.all(
    (json.images ?? []).slice(0, opts.count ?? 2).map(async (img: { url: string }) => ({
      data: await fetchBase64(img.url),
      mimeType: 'image/jpeg',
    }))
  );
  return { ok: true, images };
}

// ── Real Higgsfield call (video) ──────────────────────────────────────────────
async function realGenerateVideo(opts: HfVideoOpts): Promise<HfVideoResult> {
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
  const res = await fetch(`${API_BASE}/generate/video`, { method: 'POST', headers, body });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json) return { ok: false, error: `Higgsfield HTTP ${res.status}: ${JSON.stringify(json)}` };
  return { ok: true, videoUrl: json.video_url ?? json.url ?? null };
}

// ── Stub implementations ──────────────────────────────────────────────────────
const STUB_QUERIES: Record<string, string> = {
  pride:     'pride rainbow colorful party crowd',
  pool:      'swimming pool party summer',
  nasty:     'neon dark club night dance',
  bears:     'forest beard men gathering',
  gtd:       'tea dance music disco ball',
  karaoke:   'microphone stage spotlight',
  bollywood: 'colorful indian dance festival',
  halloween: 'pumpkin dark spooky fog',
  valentin:  'heart roses romantic pink',
  nouvel_an: 'fireworks new year celebration',
  ete:       'summer sun beach golden',
  hiver:     'winter snow cozy warm light',
  agenda:    'calendar events schedule city',
};

async function stubGenerateImage(opts: HfImageOpts): Promise<HfImageResult> {
  const count = opts.count ?? 2;
  const query = encodeURIComponent(opts.prompt.slice(0, 60));
  const images: { data: string; mimeType: string }[] = [];
  for (let i = 0; i < count; i++) {
    const seed = Math.floor(Math.random() * 1000) + i;
    const url = `https://source.unsplash.com/1280x720/?${query}&sig=${seed}`;
    try {
      const data = await fetchBase64(url);
      images.push({ data, mimeType: 'image/jpeg' });
    } catch {
      // push a 1px transparent GIF as last resort
      images.push({ data: 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', mimeType: 'image/gif' });
    }
  }
  return { ok: true, images };
}

async function stubGenerateVideo(_opts: HfVideoOpts): Promise<HfVideoResult> {
  // No video generation without real API key — return a stub placeholder URL
  return {
    ok: true,
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  };
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function generateHfImage(opts: HfImageOpts): Promise<HfImageResult> {
  if (hasKeys()) return realGenerateImage(opts);
  return stubGenerateImage(opts);
}

export async function generateHfVideo(opts: HfVideoOpts): Promise<HfVideoResult> {
  if (hasKeys()) return realGenerateVideo(opts);
  return stubGenerateVideo(opts);
}
