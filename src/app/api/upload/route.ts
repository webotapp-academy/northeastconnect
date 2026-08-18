import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { status: "error", message: "Please sign in to upload photos" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { status: "error", message: "No files uploaded" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "marketplace");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Validate type
      if (!file.type.startsWith("image/")) {
        continue;
      }

      // Max size limit: 10MB per image
      if (file.size > 10 * 1024 * 1024) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Safe clean extension
      const ext = path.extname(file.name) || ".jpg";
      const cleanExt = ext.toLowerCase().replace(/[^a-z0-9.]/g, "");
      const uniqueName = `ad_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${cleanExt}`;
      const filePath = path.join(uploadDir, uniqueName);

      await writeFile(filePath, buffer);
      uploadedUrls.push(`/uploads/marketplace/${uniqueName}`);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { status: "error", message: "Failed to process uploaded images. Please ensure valid image files (JPG, PNG, WebP) under 10MB." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: "success",
      urls: uploadedUrls,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to upload images" },
      { status: 500 }
    );
  }
}
