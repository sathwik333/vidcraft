import { Router } from "express";
import multer from "multer";
import { uploadImage } from "../services/storage.js";
import { logger } from "../utils/logger.js";
import type { AuthenticatedRequest } from "../types/index.js";

const router = Router();

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/tiff",
  "image/bmp",
];

const ALLOWED_EXTENSIONS = [
  ".jpg", ".jpeg", ".png", ".webp", ".tiff", ".tif", ".bmp",
  ".cr2", ".nef", ".arw", ".dng", ".orf", ".rw2",
];

// RAW format extensions that bypass magic byte checks (no standard signatures)
const RAW_EXTENSIONS = [".cr2", ".nef", ".arw", ".dng", ".orf", ".rw2"];

// Magic byte signatures for content-type verification
const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xFF, 0xD8, 0xFF]],
  "image/png": [[0x89, 0x50, 0x4E, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF header
  "image/tiff": [[0x49, 0x49, 0x2A, 0x00], [0x4D, 0x4D, 0x00, 0x2A]],
  "image/bmp": [[0x42, 0x4D]],
};

function verifyMagicBytes(buffer: Buffer, mimetype: string): boolean {
  const signatures = MAGIC_BYTES[mimetype];
  if (!signatures) return true; // No signature to check (RAW formats)
  return signatures.some((sig) =>
    sig.every((byte, i) => buffer.length > i && buffer[i] === byte)
  );
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const ext = "." + (file.originalname.split(".").pop()?.toLowerCase() || "");
    const isRaw = RAW_EXTENSIONS.includes(ext);

    // RAW formats: only check extension (MIME types are unreliable for RAW)
    if (isRaw) {
      cb(null, true);
      return;
    }

    // Standard images: require BOTH valid MIME type AND valid extension
    const validMime = ALLOWED_MIME_TYPES.includes(file.mimetype);
    const validExt = ALLOWED_EXTENSIONS.includes(ext);
    if (validMime && validExt) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. Supported: JPG, PNG, WebP, TIFF, BMP, RAW"));
    }
  },
});

router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: "No image file provided", code: "NO_FILE" });
      return;
    }

    // Verify magic bytes match declared MIME type (post-upload deep check)
    const ext = "." + (file.originalname.split(".").pop()?.toLowerCase() || "");
    const isRaw = RAW_EXTENSIONS.includes(ext);
    if (!isRaw && !verifyMagicBytes(file.buffer, file.mimetype)) {
      logger.warn("File magic bytes mismatch", {
        userId: authReq.userId,
        mimetype: file.mimetype,
        filename: file.originalname,
      });
      res.status(400).json({
        error: "File content does not match declared type",
        code: "INVALID_FILE_CONTENT",
      });
      return;
    }

    const url = await uploadImage(
      file.buffer,
      file.originalname,
      file.mimetype,
      authReq.userId
    );

    logger.info("Image uploaded", { userId: authReq.userId, url });
    res.json({ url });
  } catch (err) {
    next(err);
  }
});

export default router;
