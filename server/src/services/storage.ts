import { supabase } from "../config/supabase.js";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger.js";

export async function uploadImage(
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string,
  userId: string
): Promise<string> {
  const ext = originalName.split(".").pop() || "jpg";
  const fileName = `${userId}/${uuidv4()}.${ext}`;

  const { error } = await supabase.storage
    .from("photos")
    .upload(fileName, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    logger.error("Failed to upload image", { error: error.message });
    throw new Error("Failed to upload image");
  }

  const { data: urlData } = supabase.storage
    .from("photos")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

export async function uploadVideo(
  videoBuffer: Buffer,
  userId: string,
  generationId: string,
  format: string = "mp4"
): Promise<string> {
  const fileName = `${userId}/${generationId}.${format}`;

  const { error } = await supabase.storage
    .from("videos")
    .upload(fileName, videoBuffer, {
      contentType: `video/${format}`,
      upsert: true,
    });

  if (error) {
    logger.error("Failed to upload video", { error: error.message });
    throw new Error("Failed to upload video");
  }

  const { data: urlData } = supabase.storage
    .from("videos")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

export async function deleteFile(
  bucket: "photos" | "videos",
  path: string
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    logger.error("Failed to delete file", { bucket, path, error: error.message });
  }
}
