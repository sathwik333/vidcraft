import { motion, AnimatePresence } from "framer-motion";
import {
  ImageIcon,
  Cpu,
  Palette,
  Type,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { useGenerationStore } from "@/stores/useGenerationStore";
import { useGenerateVideo } from "@/hooks/useGenerateVideo";
import { useRestoreGeneration } from "@/hooks/useRestoreGeneration";

import { PhotoUpload } from "@/components/generate/PhotoUpload";
import { ModelSelector } from "@/components/generate/ModelSelector";
import { StyleSelector } from "@/components/generate/StyleSelector";
import { PromptEditor } from "@/components/generate/PromptEditor";
import { DurationRatioSelector } from "@/components/generate/DurationRatioSelector";
import { GenerateButton } from "@/components/generate/GenerateButton";
import { ProgressTracker } from "@/components/generate/ProgressTracker";
import { VideoPreview } from "@/components/generate/VideoPreview";
import { GenerationError } from "@/components/generate/GenerationError";
import { ModelComparison } from "@/components/generate/ModelComparison";
import { ScrollReveal } from "@/components/animation/ScrollReveal";

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  step: number;
  children: React.ReactNode;
}

function Section({ icon, title, description, step, children }: SectionProps) {
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/15 text-gold-500 text-sm font-bold shrink-0">
          {step}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[hsl(var(--muted-foreground))]">{icon}</span>
          <div>
            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      {children}
    </motion.section>
  );
}

export default function GeneratePage() {
  // Restore any in-progress generation from server on page load
  useRestoreGeneration();
  // Keep polling alive at the page level (not inside GenerateButton)
  const { startGeneration } = useGenerateVideo();

  const {
    uploadedFile,
    uploadedImageUrl,
    selectedModel,
    selectedStyle,
    status,
  } = useGenerationStore();

  const hasFile = !!uploadedFile || !!uploadedImageUrl;
  const hasModel = !!selectedModel;
  const hasStyle = !!selectedStyle;
  const isGenerating =
    status === "uploading" || status === "generating" || status === "polling";
  const isCompleted = status === "completed";
  const isFailed = status === "failed";

  return (
    <PageWrapper>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-2">
        {/* Page header */}
        <ScrollReveal>
          <div className="space-y-2 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-gold-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                  Generate Video
                </h1>
                <p className="text-[hsl(var(--muted-foreground))] text-sm mt-0.5">
                  Transform your photos into stunning AI-generated videos in
                  minutes.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="space-y-8">
          {/* Step 1: Photo Upload */}
          <Section
            icon={<ImageIcon className="w-4 h-4" />}
            title="Upload Your Photo"
            description="Drag and drop or click to select a high-quality image"
            step={1}
          >
            <PhotoUpload />
          </Section>

          <AnimatePresence>
            {/* Step 2: Model Selection -- visible after upload */}
            {hasFile && (
              <>
                <Separator className="bg-[hsl(var(--border))]/50" />
                <Section
                  icon={<Cpu className="w-4 h-4" />}
                  title="What type of video?"
                  description="Pick a category and we'll recommend the best models"
                  step={2}
                >
                  <ModelSelector />
                </Section>
              </>
            )}

            {/* Step 3: Style Selection -- visible after model selected */}
            {hasFile && hasModel && (
              <>
                <Separator className="bg-[hsl(var(--border))]/50" />
                <Section
                  icon={<Palette className="w-4 h-4" />}
                  title="Select a Style"
                  description="Choose a preset style or write your own custom prompt"
                  step={3}
                >
                  <StyleSelector />
                </Section>
              </>
            )}

            {/* Step 4: Prompt Editor -- visible after style selected */}
            {hasFile && hasModel && hasStyle && (
              <>
                <Separator className="bg-[hsl(var(--border))]/50" />
                <Section
                  icon={<Type className="w-4 h-4" />}
                  title="Edit Prompt"
                  description="Fine-tune the AI instructions for your video"
                  step={4}
                >
                  <PromptEditor />
                </Section>
              </>
            )}

            {/* Step 5: Duration & Aspect Ratio -- visible after style selected */}
            {hasFile && hasModel && hasStyle && (
              <>
                <Separator className="bg-[hsl(var(--border))]/50" />
                <Section
                  icon={<SlidersHorizontal className="w-4 h-4" />}
                  title="Duration & Aspect Ratio"
                  description="Configure your video output settings"
                  step={5}
                >
                  <DurationRatioSelector />
                </Section>
              </>
            )}

            {/* Model Comparison toggle -- visible after style selected */}
            {hasFile && hasModel && hasStyle && (
              <>
                <Separator className="bg-[hsl(var(--border))]/50" />
                <motion.div
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={cn(
                    "glass-card p-5"
                  )}
                >
                  <ModelComparison />
                </motion.div>
              </>
            )}

            {/* Generate Button -- visible after style selected */}
            {hasFile && hasModel && hasStyle && !isGenerating && !isCompleted && (
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <GenerateButton onGenerate={startGeneration} />
              </motion.div>
            )}

            {/* Progress Tracker -- visible during generation */}
            {isGenerating && (
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <ProgressTracker />
              </motion.div>
            )}

            {/* Error Display -- visible after failure */}
            {isFailed && (
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <GenerationError />
              </motion.div>
            )}

            {/* Video Preview -- visible after completion */}
            {isCompleted && (
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <VideoPreview />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  );
}
