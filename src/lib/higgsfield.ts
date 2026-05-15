// Backwards-compat re-export — see src/lib/ai-media.ts for the real implementation.
export {
  generateImage,
  generateVideo,
  generateHfImage,
  generateHfVideo,
  listAvailableProviders,
} from './ai-media';
export type {
  ImageProvider,
  VideoProvider,
  ImageOpts,
  VideoOpts,
  ImageResult,
  VideoResult,
  HfModel,
  HfMotion,
} from './ai-media';
