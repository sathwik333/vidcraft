import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useGenerationStore } from "@/stores/useGenerationStore";
import { SUPPORTED_IMAGE_TYPES, SUPPORTED_IMAGE_EXTENSIONS, MAX_FILE_SIZE } from "@/lib/constants";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(file: File): string | null {
  const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
  const isValidType =
    SUPPORTED_IMAGE_TYPES.includes(file.type) ||
    SUPPORTED_IMAGE_EXTENSIONS.includes(ext);

  if (!isValidType) {
    return `Unsupported file type. Accepted formats: JPG, PNG, WebP, TIFF, BMP, RAW`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `File too large (${formatFileSize(file.size)}). Maximum size is 20MB.`;
  }

  return null;
}

export function PhotoUpload() {
  const {
    uploadedFile,
    uploadedImageUrl,
    isUploading,
    setFile,
    setUploadedImageUrl,
    setIsUploading,
  } = useGenerationStore();

  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }

      // Simulate upload progress
      setIsUploading(true);
      setUploadProgress(0);

      const url = URL.createObjectURL(file);
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30 + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFile(file);
          setUploadedImageUrl(url);
          setIsUploading(false);
          setUploadProgress(100);
          toast.success("Photo uploaded successfully!");
        }
        setUploadProgress(Math.min(progress, 100));
      }, 200);
    },
    [setFile, setUploadedImageUrl, setIsUploading]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset input so the same file can be re-selected
      e.target.value = "";
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl);
    }
    setFile(null);
    setUploadedImageUrl(null);
    setUploadProgress(0);
  }, [uploadedImageUrl, setFile, setUploadedImageUrl]);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={SUPPORTED_IMAGE_EXTENSIONS.join(",")}
        onChange={handleInputChange}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {uploadedFile && uploadedImageUrl ? (
          /* Preview state */
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative group rounded-xl overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
          >
            <div className="relative aspect-video max-h-80 flex items-center justify-center bg-black/20">
              <img
                src={uploadedImageUrl}
                alt="Uploaded preview"
                className="max-h-80 w-auto object-contain"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <span className="text-sm text-[hsl(var(--foreground))] truncate">
                  {uploadedFile.name}
                </span>
                <span className="text-xs text-[hsl(var(--muted-foreground))] shrink-0">
                  {formatFileSize(uploadedFile.size)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClick}
                className="text-xs shrink-0"
              >
                Change Photo
              </Button>
            </div>
          </motion.div>
        ) : (
          /* Upload zone */
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={!isUploading ? handleClick : undefined}
              animate={{
                borderColor: isDragOver
                  ? "hsl(45, 93%, 47%)"
                  : "hsl(var(--border))",
                scale: isDragOver ? 1.01 : 1,
              }}
              transition={{ duration: 0.2 }}
              className={cn(
                "relative rounded-xl border-2 border-dashed p-8 md:p-12 text-center transition-colors",
                "bg-[hsl(var(--card))]/50 backdrop-blur-sm",
                !isUploading && "cursor-pointer hover:border-gold-500/50 hover:bg-[hsl(var(--card))]/80",
                isDragOver && "border-gold-500 bg-gold-500/5"
              )}
            >
              {/* Animated glow on drag-over */}
              <AnimatePresence>
                {isDragOver && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-xl bg-gold-500/5 pointer-events-none"
                  />
                )}
              </AnimatePresence>

              <div className="flex flex-col items-center gap-4 relative z-10">
                <motion.div
                  animate={{
                    y: isDragOver ? -4 : 0,
                    scale: isDragOver ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center",
                    isDragOver
                      ? "bg-gold-500/20 text-gold-500"
                      : "bg-[hsl(var(--muted-foreground))]/10 text-[hsl(var(--muted-foreground))]"
                  )}
                >
                  {isDragOver ? (
                    <ImageIcon className="w-8 h-8" />
                  ) : (
                    <Upload className="w-8 h-8" />
                  )}
                </motion.div>

                <div>
                  <p className="text-lg font-medium text-[hsl(var(--foreground))]">
                    {isDragOver ? "Drop your photo here" : "Drag & drop your photo"}
                  </p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                    or{" "}
                    <span className="text-gold-500 font-medium underline underline-offset-2">
                      click to browse
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                  <AlertCircle className="w-3 h-3" />
                  <span>JPG, PNG, WebP, TIFF, BMP, RAW -- Max 20MB</span>
                </div>
              </div>

              {/* Upload progress */}
              <AnimatePresence>
                {isUploading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-6"
                  >
                    <Progress
                      value={uploadProgress}
                      className="h-2 bg-[hsl(var(--border))]"
                    />
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                      Uploading... {Math.round(uploadProgress)}%
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
