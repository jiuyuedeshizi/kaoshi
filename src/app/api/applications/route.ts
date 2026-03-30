import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireCandidateApiAccess } from "@/lib/candidate-auth";
import { isNowWithin } from "@/lib/exam-window";
import { repo } from "@/lib/repository";
import { applicationSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const access = await requireCandidateApiAccess(request);
  if ("error" in access) {
    return NextResponse.json({ ok: false, error: access.error }, { status: access.status });
  }

  const body = await request.json();
  const parsed = applicationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const exam = await repo.findExamById(parsed.data.examProjectId);
  if (!exam) {
    return NextResponse.json({ ok: false, error: "考试项目不存在" }, { status: 404 });
  }

  if (!isNowWithin(exam.registrationStart, exam.registrationEnd)) {
    return NextResponse.json({ ok: false, error: "当前不在报名时间范围内" }, { status: 409 });
  }

  const job = await repo.findJobPositionById(parsed.data.jobPositionId);
  if (!job || job.examProjectId !== exam.id || !job.enabled) {
    return NextResponse.json({ ok: false, error: "岗位不存在或已停用" }, { status: 404 });
  }

  const existing = await repo.findApplicationByUserAndExam(access.current.user.id, parsed.data.examProjectId);
  if (existing) {
    if (!["DRAFT", "REJECTED"].includes(existing.status)) {
      return NextResponse.json(
        { ok: false, error: "该考试已有处理中或已完成的报名记录" },
        { status: 409 },
      );
    }

    const updated = await repo.updateApplication(existing.id, {
      jobPositionId: job.id,
      jobCode: parsed.data.jobCode,
      subjectName: parsed.data.subjectName,
      jobSnapshot: {
        id: job.id,
        code: job.code,
        name: job.name,
        subjectName: parsed.data.subjectName,
      },
      major: parsed.data.major,
      education: parsed.data.education,
      employer: parsed.data.employer,
      photoUrl: parsed.data.photoUrl,
      documents: parsed.data.documents,
    });

    return NextResponse.json({ ok: true, data: updated });
  }

  let application;
  let status = 201;

  try {
    application = await repo.createApplication({
      ...parsed.data,
      jobSnapshot: {
        id: job.id,
        code: job.code,
        name: job.name,
        subjectName: parsed.data.subjectName,
      },
      userId: access.current.user.id,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const current = await repo.findApplicationByUserAndExam(
        access.current.user.id,
        parsed.data.examProjectId,
      );

      if (!current) {
        return NextResponse.json({ ok: false, error: "报名保存失败，请稍后重试" }, { status: 409 });
      }

      if (!["DRAFT", "REJECTED"].includes(current.status)) {
        return NextResponse.json(
          { ok: false, error: "该考试已有处理中或已完成的报名记录" },
          { status: 409 },
        );
      }

      application = await repo.updateApplication(current.id, {
        jobPositionId: job.id,
        jobCode: parsed.data.jobCode,
        subjectName: parsed.data.subjectName,
        jobSnapshot: {
          id: job.id,
          code: job.code,
          name: job.name,
          subjectName: parsed.data.subjectName,
        },
        major: parsed.data.major,
        education: parsed.data.education,
        employer: parsed.data.employer,
        photoUrl: parsed.data.photoUrl,
        documents: parsed.data.documents,
      });
      status = 200;
    } else {
      throw error;
    }
  }

  return NextResponse.json({ ok: true, data: application }, { status });
}
