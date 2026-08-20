import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp, { OutputInfo } from "sharp";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export interface UploadOptions {
  folder?: string; // e.g. "community", "marketplace", "news", "directory", "avatars"
  maxWidth?: number; // max dimension (default 1920)
  quality?: number; // webp quality 1-100 (default 82)
}

export interface UploadResult {
  url: string;
  originalName: string;
  size: number;
  width?: number;
  height?: number;
  format: string;
}

// Format 2-digit strings
function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

// Get YYYY/MM/DD subpath
export function getDatePath(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = padZero(now.getMonth() + 1);
  const day = padZero(now.getDate());
  return `${year}/${month}/${day}`;
}

// Initialize S3 / R2 Client if credentials present
function getR2Client(): { client: S3Client; bucket: string; publicDomain: string } | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicDomain = (process.env.R2_PUBLIC_DOMAIN || "").replace(/\/+$/, "");

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return { client, bucket, publicDomain };
}

/**
 * Compresses an image buffer using Sharp to high-efficiency WebP.
 */
export async function compressImage(
  inputBuffer: Buffer,
  options?: { maxWidth?: number; quality?: number }
): Promise<{ buffer: Buffer; info: OutputInfo }> {
  const maxWidth = options?.maxWidth || 1920;
  const quality = options?.quality || 82;

  const result = await sharp(inputBuffer)
    .rotate()
    .resize({
      width: maxWidth,
      height: maxWidth,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: result.data,
    info: result.info,
  };
}

/**
 * Uploads a file with smart compression and YYYY/MM/DD date structuring.
 * Routes to Cloudflare R2 if configured, or falls back to local disk.
 */
export async function uploadMediaFile(
  fileBuffer: Buffer,
  originalFilename: string,
  options?: UploadOptions
): Promise<UploadResult> {
  const folder = options?.folder || "community";
  const datePath = getDatePath(); // e.g. "2026/08/20"

  // 1. Compress image to WebP
  let processedBuffer = fileBuffer;
  let format = "webp";
  let metadata: OutputInfo | undefined;

  try {
    const compressed = await compressImage(fileBuffer, {
      maxWidth: options?.maxWidth,
      quality: options?.quality,
    });
    processedBuffer = compressed.buffer;
    metadata = compressed.info;
  } catch (err) {
    console.warn("Sharp compression failed, uploading raw image buffer:", err);
  }

  const cleanBaseName = path
    .basename(originalFilename, path.extname(originalFilename))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .slice(0, 24);

  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const filename = `${cleanBaseName || "img"}_${uniqueId}.webp`;

  // Path key: e.g. "community/2026/08/20/post_1724182930_abc.webp"
  const storageKey = `${folder}/${datePath}/${filename}`;

  // 2. Check if Cloudflare R2 is configured
  const r2 = getR2Client();

  if (r2) {
    // Upload to Cloudflare R2
    const command = new PutObjectCommand({
      Bucket: r2.bucket,
      Key: storageKey,
      Body: processedBuffer,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    });

    await r2.client.send(command);

    const publicUrl = r2.publicDomain
      ? `${r2.publicDomain}/${storageKey}`
      : `https://${r2.bucket}.r2.cloudflarestorage.com/${storageKey}`;

    return {
      url: publicUrl,
      originalName: originalFilename,
      size: processedBuffer.length,
      width: metadata?.width,
      height: metadata?.height,
      format,
    };
  }

  // 3. Fallback: Save to Local Server Storage in /public/uploads/folder/YYYY/MM/DD/
  const localTargetDir = path.join(process.cwd(), "public", "uploads", folder, ...datePath.split("/"));

  if (!existsSync(localTargetDir)) {
    await mkdir(localTargetDir, { recursive: true });
  }

  const localFilePath = path.join(localTargetDir, filename);
  await writeFile(localFilePath, processedBuffer);

  const publicUrl = `/uploads/${folder}/${datePath}/${filename}`;

  return {
    url: publicUrl,
    originalName: originalFilename,
    size: processedBuffer.length,
    width: metadata?.width,
    height: metadata?.height,
    format,
  };
}
