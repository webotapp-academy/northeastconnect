import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getJobSlugUrl } from "@/lib/slugs";

// GET /api/jobs — List, Search & Filter Jobs
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const type = searchParams.get("type") || "";
    const state = searchParams.get("state") || "";
    const sort = searchParams.get("sort") || "recent"; // recent, views, salary
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
    const skip = (page - 1) * limit;

    const where: any = {
      status: "Open",
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
        { jobDescription: { contains: q, mode: "insensitive" } },
        { skillsRequired: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
        { district: { contains: q, mode: "insensitive" } },
      ];
    }

    if (category && category !== "All" && !category.startsWith("All")) {
      where.category = { contains: category, mode: "insensitive" };
    }

    if (type && type !== "All" && !type.startsWith("All")) {
      where.type = { contains: type, mode: "insensitive" };
    }

    if (state && state !== "All" && state !== "All States" && !state.startsWith("All")) {
      where.OR = [
        ...(where.OR || []),
        { state: { contains: state, mode: "insensitive" } },
        { location: { contains: state, mode: "insensitive" } },
        { district: { contains: state, mode: "insensitive" } },
      ];
    }

    let orderBy: any[] = [{ createdAt: "desc" }];
    if (sort === "views") {
      orderBy = [{ viewsCount: "desc" }, { createdAt: "desc" }];
    } else if (sort === "salary") {
      orderBy = [{ salaryMax: "desc" }, { salaryMin: "desc" }, { createdAt: "desc" }];
    }

    const currentUser = await getCurrentUser();

    const [jobs, total, userApplications] = await Promise.all([
      db.job.findMany({
        where,
        select: {
          id: true,
          title: true,
          company: true,
          category: true,
          type: true,
          location: true,
          district: true,
          state: true,
          salaryMin: true,
          salaryMax: true,
          salaryPeriod: true,
          experienceMin: true,
          experienceMax: true,
          skillsRequired: true,
          jobDescription: true,
          applicationDeadline: true,
          viewsCount: true,
          applicationsCount: true,
          companyLogo: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              profileImageUrl: true,
              isVerified: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.job.count({ where }),
      currentUser
        ? db.jobApplication.findMany({
            where: {
              OR: [
                { userId: currentUser.id },
                { email: { equals: currentUser.email, mode: "insensitive" } },
              ],
            },
            select: { jobId: true, status: true },
          })
        : Promise.resolve([]),
    ]);

    const appliedStatusMap: Record<number, string> = {};
    userApplications.forEach((app) => {
      appliedStatusMap[app.jobId] = app.status;
    });

    const enrichedJobs = jobs.map((job) => ({
      ...job,
      slugUrl: getJobSlugUrl(job),
      hasApplied: !!appliedStatusMap[job.id],
      appliedStatus: appliedStatusMap[job.id] || null,
    }));

    return NextResponse.json({
      status: "success",
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + jobs.length < total,
      jobs: enrichedJobs,
      appliedJobIds: Object.keys(appliedStatusMap).map(Number),
    });
  } catch (error: any) {
    console.error("GET /api/jobs error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch job listings" },
      { status: 500 }
    );
  }
}

// POST /api/jobs — Post a New Job
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json(
        { status: "error", message: "Authentication required to post a job" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      company,
      category,
      type,
      location,
      district,
      state,
      salaryMin,
      salaryMax,
      salaryPeriod,
      experienceMin,
      experienceMax,
      skillsRequired,
      jobDescription,
      responsibilities,
      qualifications,
      applicationDeadline,
      contactEmail,
      contactPhone,
      howToApply,
      companyLogo,
    } = body;

    if (!title || !category || !type || !jobDescription) {
      return NextResponse.json(
        { status: "error", message: "Title, category, job type, and job description are required." },
        { status: 400 }
      );
    }

    const newJob = await db.job.create({
      data: {
        title: title.trim(),
        company: company ? company.trim() : null,
        category: category.trim(),
        type: type.trim(),
        location: location ? location.trim() : null,
        district: district ? district.trim() : null,
        state: state ? state.trim() : null,
        salaryMin: salaryMin ? parseFloat(salaryMin) : null,
        salaryMax: salaryMax ? parseFloat(salaryMax) : null,
        salaryPeriod: salaryPeriod || "monthly",
        experienceMin: experienceMin ? parseInt(experienceMin, 10) : 0,
        experienceMax: experienceMax ? parseInt(experienceMax, 10) : null,
        skillsRequired: skillsRequired ? skillsRequired.trim() : null,
        jobDescription: jobDescription.trim(),
        responsibilities: responsibilities ? responsibilities.trim() : null,
        qualifications: qualifications ? qualifications.trim() : null,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        contactEmail: contactEmail ? contactEmail.trim() : null,
        contactPhone: contactPhone ? contactPhone.trim() : null,
        howToApply: howToApply ? howToApply.trim() : null,
        companyLogo: companyLogo || null,
        userId: user.id,
        status: "Open",
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Job posted successfully",
      job: newJob,
    });
  } catch (error: any) {
    console.error("POST /api/jobs error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to create job opening" },
      { status: 500 }
    );
  }
}
