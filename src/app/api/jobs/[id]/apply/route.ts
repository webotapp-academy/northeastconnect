import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { parseEntityId } from "@/lib/slugs";

// POST /api/jobs/[id]/apply — Apply for a Job Opening
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const jobId = parseEntityId(params.id);
    if (!jobId) {
      return NextResponse.json({ status: "error", message: "Invalid Job ID" }, { status: 400 });
    }

    const job = await db.job.findUnique({
      where: { id: jobId },
      select: { id: true, title: true, userId: true, status: true },
    });

    if (!job) {
      return NextResponse.json({ status: "error", message: "Job not found" }, { status: 404 });
    }

    if (job.status !== "Open") {
      return NextResponse.json(
        { status: "error", message: "This job opening is currently closed." },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      experience,
      currentRole,
      resumeUrl,
      portfolioUrl,
      coverNote,
    } = body;

    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { status: "error", message: "Full Name, Email, and Phone number are required to apply." },
        { status: 400 }
      );
    }

    // Check if candidate has already submitted an application
    const searchConditions: any[] = [{ email: email.trim().toLowerCase() }];
    if (user?.id) {
      searchConditions.push({ userId: user.id });
    }

    const existingApplication = await db.jobApplication.findFirst({
      where: {
        jobId,
        OR: searchConditions,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        {
          status: "error",
          message: `You have already applied for this opening. Application status: ${existingApplication.status}`,
          alreadyApplied: true,
          application: existingApplication,
        },
        { status: 400 }
      );
    }

    // Create JobApplication
    const application = await db.jobApplication.create({
      data: {
        jobId,
        userId: user?.id || null,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        experience: experience ? experience.trim() : null,
        currentRole: currentRole ? currentRole.trim() : null,
        resumeUrl: resumeUrl ? resumeUrl.trim() : null,
        portfolioUrl: portfolioUrl ? portfolioUrl.trim() : null,
        coverNote: coverNote ? coverNote.trim() : null,
        status: "Submitted",
      },
    });

    // Increment application count on Job
    await db.job.update({
      where: { id: jobId },
      data: { applicationsCount: { increment: 1 } },
    });

    // If job was posted by a registered user, send notification
    if (job.userId && job.userId !== user?.id) {
      try {
        await db.notification.create({
          data: {
            userId: job.userId,
            actorId: user?.id || null,
            type: "JOB_APPLICATION",
            title: "New Job Application Received",
            message: `${fullName.trim()} applied for your job opening: "${job.title}"`,
            linkUrl: `/jobs/my-jobs`,
          },
        });
      } catch (notifErr) {
        console.error("Failed to create job notification:", notifErr);
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Application submitted successfully! The hiring team has received your profile.",
      applicationId: application.id,
    });
  } catch (error: any) {
    console.error("POST /api/jobs/[id]/apply error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to submit application" },
      { status: 500 }
    );
  }
}
