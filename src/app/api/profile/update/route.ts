import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { awardUserXp } from "@/lib/gamification";

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      bio,
      state,
      city,
      profileImageUrl,
      coverImageUrl,
      websiteUrl,
      socialLinks,
      mobileNumber,
    } = body;

    const hadProfileBefore = !!(currentUser.bio || currentUser.state || currentUser.coverImageUrl);

    const updatedUser = await db.user.update({
      where: { id: currentUser.id },
      data: {
        fullName: fullName !== undefined ? fullName : currentUser.fullName,
        bio: bio !== undefined ? bio : currentUser.bio,
        state: state !== undefined ? state : currentUser.state,
        city: city !== undefined ? city : currentUser.city,
        profileImageUrl: profileImageUrl !== undefined ? profileImageUrl : currentUser.profileImageUrl,
        coverImageUrl: coverImageUrl !== undefined ? coverImageUrl : currentUser.coverImageUrl,
        websiteUrl: websiteUrl !== undefined ? websiteUrl : currentUser.websiteUrl,
        socialLinks: socialLinks !== undefined ? (typeof socialLinks === "string" ? socialLinks : JSON.stringify(socialLinks)) : currentUser.socialLinks,
        mobileNumber: mobileNumber !== undefined ? mobileNumber : currentUser.mobileNumber,
      },
    });

    // Check if user completed profile for the first time
    if (!hadProfileBefore && (bio || state || coverImageUrl)) {
      await awardUserXp(currentUser.id, "PROFILE_COMPLETED", 50, "Completed profile info");
    }

    return NextResponse.json({
      status: "success",
      message: "Profile updated successfully!",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
