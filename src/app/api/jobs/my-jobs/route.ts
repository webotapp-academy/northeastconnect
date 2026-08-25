import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET /api/jobs/my-jobs — Get Jobs Posted By Current User with Applications
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const jobs = await db.job.findMany({
      where: { userId: user.id },
      include: {
        applications: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            experience: true,
            currentRole: true,
            resumeUrl: true,
            portfolioUrl: true,
            coverNote: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enrichedJobs = jobs.map((job) => ({
      ...job,
      applicationsCount: job.applications?.length || 0,
    }));

    return NextResponse.json({
      status: "success",
      jobs: enrichedJobs,
    });
  } catch (error: any) {
    console.error("GET /api/jobs/my-jobs error:", error);
    return NextResponse.json({ status: "error", message: "Failed to fetch jobs" }, { status: 500 });
  }
}
