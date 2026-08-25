import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { parseEntityId, getJobSlugUrl } from "@/lib/slugs";

// GET /api/jobs/[id] — Single Job Details (Supports numeric ID or slug URL)
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = parseEntityId(params.id);
    if (!id) {
      return NextResponse.json({ status: "error", message: "Invalid Job ID" }, { status: 400 });
    }

    const job = await db.job.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImageUrl: true,
            isVerified: true,
            rankTier: true,
            xpPoints: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ status: "error", message: "Job not found" }, { status: 404 });
    }

    // Check if the requesting user has already applied
    const currentUser = await getCurrentUser();
    let userApplication = null;
    if (currentUser) {
      userApplication = await db.jobApplication.findFirst({
        where: {
          jobId: id,
          OR: [
            { userId: currentUser.id },
            { email: { equals: currentUser.email, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          fullName: true,
          currentRole: true,
          resumeUrl: true,
          coverNote: true,
          phone: true,
          email: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Increment views count asynchronously in background
    db.job
      .update({
        where: { id },
        data: { viewsCount: { increment: 1 } },
      })
      .catch(() => {});

    return NextResponse.json({
      status: "success",
      job: {
        ...job,
        slugUrl: getJobSlugUrl(job),
      },
      hasApplied: !!userApplication,
      myApplication: userApplication,
    });
  } catch (error: any) {
    console.error("GET /api/jobs/[id] error:", error);
    return NextResponse.json({ status: "error", message: "Failed to fetch job" }, { status: 500 });
  }
}

// PATCH /api/jobs/[id] — Update Job Details or Status
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
    const id = parseEntityId(params.id);
    if (!id) {
      return NextResponse.json({ status: "error", message: "Invalid Job ID" }, { status: 400 });
    }

    const existingJob = await db.job.findUnique({ where: { id } });
    if (!existingJob) {
      return NextResponse.json({ status: "error", message: "Job not found" }, { status: 404 });
    }

    const isAdmin =
      (user.role || "").toLowerCase() === "admin" ||
      (user.role || "").toLowerCase() === "superadmin";

    if (existingJob.userId !== user.id && !isAdmin) {
      return NextResponse.json(
        { status: "error", message: "Forbidden: You do not own this job opening." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = await db.job.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title.trim() }),
        ...(body.company !== undefined && { company: body.company ? body.company.trim() : null }),
        ...(body.category && { category: body.category.trim() }),
        ...(body.type && { type: body.type.trim() }),
        ...(body.location !== undefined && { location: body.location ? body.location.trim() : null }),
        ...(body.district !== undefined && { district: body.district ? body.district.trim() : null }),
        ...(body.state !== undefined && { state: body.state ? body.state.trim() : null }),
        ...(body.salaryMin !== undefined && { salaryMin: body.salaryMin ? parseFloat(body.salaryMin) : null }),
        ...(body.salaryMax !== undefined && { salaryMax: body.salaryMax ? parseFloat(body.salaryMax) : null }),
        ...(body.salaryPeriod && { salaryPeriod: body.salaryPeriod }),
        ...(body.experienceMin !== undefined && { experienceMin: parseInt(body.experienceMin, 10) }),
        ...(body.experienceMax !== undefined && { experienceMax: parseInt(body.experienceMax, 10) }),
        ...(body.skillsRequired !== undefined && { skillsRequired: body.skillsRequired }),
        ...(body.jobDescription && { jobDescription: body.jobDescription.trim() }),
        ...(body.responsibilities !== undefined && { responsibilities: body.responsibilities }),
        ...(body.qualifications !== undefined && { qualifications: body.qualifications }),
        ...(body.applicationDeadline !== undefined && {
          applicationDeadline: body.applicationDeadline ? new Date(body.applicationDeadline) : null,
        }),
        ...(body.contactEmail !== undefined && { contactEmail: body.contactEmail }),
        ...(body.contactPhone !== undefined && { contactPhone: body.contactPhone }),
        ...(body.howToApply !== undefined && { howToApply: body.howToApply }),
        ...(body.companyLogo !== undefined && { companyLogo: body.companyLogo }),
        ...(body.status && { status: body.status }),
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Job updated successfully",
      job: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/jobs/[id] error:", error);
    return NextResponse.json({ status: "error", message: "Failed to update job" }, { status: 500 });
  }
}

// DELETE /api/jobs/[id] — Delete Job
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const params = await props.params;
    const id = parseEntityId(params.id);
    if (!id) {
      return NextResponse.json({ status: "error", message: "Invalid Job ID" }, { status: 400 });
    }

    const existingJob = await db.job.findUnique({ where: { id } });
    if (!existingJob) {
      return NextResponse.json({ status: "error", message: "Job not found" }, { status: 404 });
    }

    const isAdmin =
      (user.role || "").toLowerCase() === "admin" ||
      (user.role || "").toLowerCase() === "superadmin";

    if (existingJob.userId !== user.id && !isAdmin) {
      return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });
    }

    await db.job.delete({ where: { id } });

    return NextResponse.json({
      status: "success",
      message: "Job deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/jobs/[id] error:", error);
    return NextResponse.json({ status: "error", message: "Failed to delete job" }, { status: 500 });
  }
}
