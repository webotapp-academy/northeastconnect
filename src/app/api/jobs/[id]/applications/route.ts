import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET /api/jobs/[id]/applications — Retrieve Candidate Applications for a Job Opening
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const params = await props.params;
    const jobId = parseInt(params.id, 10);
    if (isNaN(jobId)) {
      return NextResponse.json({ status: "error", message: "Invalid Job ID" }, { status: 400 });
    }

    const job = await db.job.findUnique({
      where: { id: jobId },
      select: { id: true, userId: true, title: true },
    });

    if (!job) {
      return NextResponse.json({ status: "error", message: "Job not found" }, { status: 404 });
    }

    const isAdmin =
      (user.role || "").toLowerCase() === "admin" ||
      (user.role || "").toLowerCase() === "superadmin";

    if (job.userId !== user.id && !isAdmin) {
      return NextResponse.json(
        { status: "error", message: "Forbidden: You are not the employer for this job." },
        { status: 403 }
      );
    }

    const applications = await db.jobApplication.findMany({
      where: { jobId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      status: "success",
      jobTitle: job.title,
      total: applications.length,
      applications,
    });
  } catch (error: any) {
    console.error("GET /api/jobs/[id]/applications error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch candidate applications" },
      { status: 500 }
    );
  }
}

// PATCH /api/jobs/[id]/applications — Update Candidate Application Status
export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const params = await props.params;
    const jobId = parseInt(params.id, 10);
    if (isNaN(jobId)) {
      return NextResponse.json({ status: "error", message: "Invalid Job ID" }, { status: 400 });
    }

    const job = await db.job.findUnique({
      where: { id: jobId },
      select: { id: true, userId: true },
    });

    if (!job) {
      return NextResponse.json({ status: "error", message: "Job not found" }, { status: 404 });
    }

    const isAdmin =
      (user.role || "").toLowerCase() === "admin" ||
      (user.role || "").toLowerCase() === "superadmin";

    if (job.userId !== user.id && !isAdmin) {
      return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { applicationId, status } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { status: "error", message: "Application ID and Status are required." },
        { status: 400 }
      );
    }

    const updated = await db.jobApplication.update({
      where: { id: applicationId },
      data: { status },
    });

    return NextResponse.json({
      status: "success",
      message: "Application status updated",
      application: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/jobs/[id]/applications error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to update application status" },
      { status: 500 }
    );
  }
}
