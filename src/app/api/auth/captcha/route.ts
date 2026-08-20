import { NextResponse } from "next/server";
import { createSvgCaptcha } from "@/lib/captcha";

export async function GET() {
  try {
    const { svg, captchaKey } = createSvgCaptcha();

    return NextResponse.json({
      status: "success",
      svg,
      captchaKey,
    });
  } catch (error: any) {
    console.error("Captcha generation error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to generate captcha" },
      { status: 500 }
    );
  }
}
