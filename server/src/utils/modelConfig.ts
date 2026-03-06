export interface ModelConfig {
  displayName: string;
  kieModelId: string;
  description: string;
  hasAudio: boolean;
  maxQuality: string;
  durations: number[];
  aspectRatios: string[];
  creditCost: Record<number, number>;
  tier: "free" | "basic" | "pro";
}

export const MODEL_CONFIG: Record<string, ModelConfig> = {
  "veo-3.1": {
    displayName: "Google Veo 3.1",
    kieModelId: "veo-3.1",
    description: "Google DeepMind's video model with cinematic motion, prompt adherence, and synchronized audio in native 1080p.",
    hasAudio: true,
    maxQuality: "1080p",
    durations: [5, 8, 10],
    aspectRatios: ["16:9", "9:16", "1:1"],
    creditCost: { 5: 1, 8: 2, 10: 3 },
    tier: "free",
  },
  "runway-gen4-turbo": {
    displayName: "Runway Gen-4 Turbo",
    kieModelId: "runway-gen4-turbo",
    description: "Cinematic quality with fast turnaround. Supports text-to-video and image-to-video with multiple aspect ratios.",
    hasAudio: false,
    maxQuality: "1080p",
    durations: [5, 10],
    aspectRatios: ["16:9", "9:16", "1:1", "4:3"],
    creditCost: { 5: 2, 10: 4 },
    tier: "pro",
  },
  "kling-2.1": {
    displayName: "Kling 2.1",
    kieModelId: "kling-2.1",
    description: "Versatile video generation with consistent motion and strong prompt following. No audio output.",
    hasAudio: false,
    maxQuality: "1080p",
    durations: [5, 10],
    aspectRatios: ["16:9", "9:16", "1:1"],
    creditCost: { 5: 2, 10: 3 },
    tier: "basic",
  },
  "kling-3.0": {
    displayName: "Kling 3.0",
    kieModelId: "kling-3.0",
    description: "Multi-shot storytelling with native sound effects, element references, and cinematic control up to 15s.",
    hasAudio: true,
    maxQuality: "pro",
    durations: [5, 10, 15],
    aspectRatios: ["16:9", "9:16", "1:1"],
    creditCost: { 5: 3, 10: 5, 15: 8 },
    tier: "pro",
  },
  "kling-2.5-turbo": {
    displayName: "Kling 2.5 Turbo",
    kieModelId: "kling-2.5-turbo",
    description: "Fast turbo text-to-video generation with negative prompt support. No audio output.",
    hasAudio: false,
    maxQuality: "720p",
    durations: [5],
    aspectRatios: ["16:9", "9:16", "1:1"],
    creditCost: { 5: 2 },
    tier: "basic",
  },
  "hailuo-2.3": {
    displayName: "Hailuo 2.3",
    kieModelId: "hailuo-2.3",
    description: "High-fidelity video with expressive characters, realistic motion, and cinematic visual quality. No audio.",
    hasAudio: false,
    maxQuality: "768p",
    durations: [6],
    aspectRatios: ["16:9", "9:16", "1:1"],
    creditCost: { 6: 2 },
    tier: "basic",
  },
  "wan-2.6": {
    displayName: "Wan 2.6",
    kieModelId: "wan-2.6",
    description: "Affordable 1080p video with stable character consistency, natural motion, and synchronized audio.",
    hasAudio: true,
    maxQuality: "1080p",
    durations: [5],
    aspectRatios: ["16:9", "9:16", "1:1"],
    creditCost: { 5: 2 },
    tier: "basic",
  },
  "bytedance-seedance": {
    displayName: "Bytedance Seedance",
    kieModelId: "bytedance-seedance",
    description: "Fast and efficient video generation with multi-shot scene cuts and camera control. No audio.",
    hasAudio: false,
    maxQuality: "720p",
    durations: [5],
    aspectRatios: ["16:9", "9:16", "1:1"],
    creditCost: { 5: 2 },
    tier: "basic",
  },
  "grok-imagine": {
    displayName: "Grok Imagine",
    kieModelId: "grok-imagine",
    description: "xAI's multimodal model with coherent motion and synchronized audio output. Produces video with sound.",
    hasAudio: true,
    maxQuality: "480p",
    durations: [6, 10],
    aspectRatios: ["16:9", "9:16", "1:1", "2:3"],
    creditCost: { 6: 3, 10: 5 },
    tier: "pro",
  },
  "runway-aleph": {
    displayName: "Runway Aleph",
    kieModelId: "runway-aleph",
    description: "In-context video editing — add/remove objects, change lighting, angles, or styles via text prompts. No audio.",
    hasAudio: false,
    maxQuality: "1080p",
    durations: [5, 10],
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    creditCost: { 5: 3, 10: 5 },
    tier: "pro",
  },
  "sora-2": {
    displayName: "Sora 2",
    kieModelId: "sora-2",
    description: "OpenAI's premium video model with the longest durations, highest quality output, and native synchronized audio.",
    hasAudio: true,
    maxQuality: "1080p",
    durations: [5, 10, 15, 20],
    aspectRatios: ["16:9", "9:16", "1:1"],
    creditCost: { 5: 3, 10: 5, 15: 7, 20: 10 },
    tier: "pro",
  },
};

export function getModelConfig(modelId: string): ModelConfig | undefined {
  return MODEL_CONFIG[modelId];
}

export function getCreditCost(modelId: string, duration: number): number {
  const model = MODEL_CONFIG[modelId];
  if (!model) return 0;
  return model.creditCost[duration] ?? 0;
}
