import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadMediaFile } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { status: "error", message: "Please sign in to upload photos" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const targetFolder = searchParams.get("folder") || "community";

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { status: "error", message: "No files uploaded" },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Validate type
      if (!file.type.startsWith("image/")) {
        continue;
      }

      // Max size limit: 15MB per raw image (will be compressed down to ~150KB WebP)
      if (file.size > 15 * 1024 * 1024) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Compress and upload to YYYY/MM/DD (Cloudflare R2 or Local)
      const result = await uploadMediaFile(buffer, file.name, {
        folder: targetFolder,
        maxWidth: 1920,
        quality: 82,
      });

      uploadedUrls.push(result.url);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to process uploaded images. Please ensure valid image files (JPG, PNG, WebP) under 15MB.",
        },
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
