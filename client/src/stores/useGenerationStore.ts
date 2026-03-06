import { create } from "zustand";

export type GenerationStatus =
  | "idle"
  | "uploading"
  | "generating"
  | "polling"
  | "completed"
  | "failed";

interface GenerationStore {
  // Upload
  uploadedFile: File | null;
  uploadedImageUrl: string | null;
  isUploading: boolean;

  // Configuration
  selectedModel: string | null;
  selectedStyle: string | null;
  prompt: string;
  duration: number;
  aspectRatio: string;

  // Generation
  generationId: string | null;
  taskId: string | null;
  status: GenerationStatus;
  progress: number;
  resultVideoUrl: string | null;
  errorMessage: string | null;

  // Comparison mode
  comparisonEnabled: boolean;
  comparisonModels: string[];

  // Actions
  setFile: (file: File | null) => void;
  setUploadedImageUrl: (url: string | null) => void;
  setIsUploading: (uploading: boolean) => void;
  setModel: (model: string | null) => void;
  setStyle: (style: string | null) => void;
  setPrompt: (prompt: string) => void;
  setDuration: (duration: number) => void;
  setAspectRatio: (ratio: string) => void;
  setGenerationId: (id: string | null) => void;
  setTaskId: (taskId: string | null) => void;
  setStatus: (status: GenerationStatus) => void;
  setProgress: (progress: number) => void;
  setResultVideoUrl: (url: string | null) => void;
  setErrorMessage: (message: string | null) => void;
  setComparisonEnabled: (enabled: boolean) => void;
  toggleComparisonModel: (modelId: string) => void;
  reset: () => void;
}

const initialState = {
  uploadedFile: null,
  uploadedImageUrl: null,
  isUploading: false,
  selectedModel: null,
  selectedStyle: null,
  prompt: "",
  duration: 5,
  aspectRatio: "16:9",
  generationId: null,
  taskId: null,
  status: "idle" as GenerationStatus,
  progress: 0,
  resultVideoUrl: null,
  errorMessage: null,
  comparisonEnabled: false,
  comparisonModels: [] as string[],
};

export const useGenerationStore = create<GenerationStore>()((set) => ({
  ...initialState,

  setFile: (file) => set({ uploadedFile: file }),
  setUploadedImageUrl: (url) => set({ uploadedImageUrl: url }),
  setIsUploading: (uploading) => set({ isUploading: uploading }),
  setModel: (model) => set({ selectedModel: model }),
  setStyle: (style) => set({ selectedStyle: style }),
  setPrompt: (prompt) => set({ prompt }),
  setDuration: (duration) => set({ duration }),
  setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
  setGenerationId: (id) => set({ generationId: id }),
  setTaskId: (taskId) => set({ taskId }),
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setResultVideoUrl: (url) => set({ resultVideoUrl: url }),
  setErrorMessage: (message) => set({ errorMessage: message }),
  setComparisonEnabled: (enabled) =>
    set({ comparisonEnabled: enabled, comparisonModels: [] }),
  toggleComparisonModel: (modelId) =>
    set((state) => {
      const models = state.comparisonModels.includes(modelId)
        ? state.comparisonModels.filter((m) => m !== modelId)
        : [...state.comparisonModels, modelId];
      return { comparisonModels: models };
    }),
  reset: () => set(initialState),
}));
