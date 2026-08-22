import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MASTER_ADDAS } from "@/lib/addas";

const INVITE_LINK_PATTERNS = [/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/, /^https:\/\/t\.me\/[A-Za-z0-9_+/]+$/];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const groupName = (body.groupName || "").trim().slice(0, 100);
    const platform = body.platform === "telegram" ? "telegram" : "whatsapp";
    const inviteLink = (body.inviteLink || "").trim();
    const addaSlug = (body.addaSlug || "").trim();
    const description = (body.description || "").trim().slice(0, 300);
    const submitterName = (body.submitterName || "").trim().slice(0, 80);

    if (!groupName || !inviteLink) {
      return NextResponse.json({ status: "error", message: "Group name and invite link are required" }, { status: 400 });
    }

    if (!INVITE_LINK_PATTERNS.some((re) => re.test(inviteLink))) {
      return NextResponse.json(
        { status: "error", message: "Invite link must be a real chat.whatsapp.com or t.me link" },
        { status: 400 }
      );
    }

    const addaValid = !addaSlug || MASTER_ADDAS.some((a) => a.id === addaSlug);
    if (!addaValid) {
      return NextResponse.json({ status: "error", message: "Unknown Adda" }, { status: 400 });
    }

    const lead = await db.lead.create({
      data: {
        name: groupName,
        mobile: submitterName || null,
        listingId: "group-submission",
        timestamp: new Date().toISOString(),
        status: "pending",
        notes: JSON.stringify({ platform, inviteLink, addaSlug, description }),
      },
    });

    return NextResponse.json({ status: "success", id: lead.id });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error?.message }, { status: 500 });
  }
}
