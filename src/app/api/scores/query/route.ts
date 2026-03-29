import { NextResponse } from "next/server";
import { repo } from "@/lib/repository";
import { scoreQuerySchema } from "@/lib/validators";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = scoreQuerySchema.safeParse({
    ticketNo: url.searchParams.get("ticketNo") ?? undefined,
    idCard: url.searchParams.get("idCard") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const score = await repo.findScore(parsed.data);

  if (!score || !score.published) {
    return NextResponse.json(
      { ok: false, error: "成绩未发布或查询条件不匹配" },
      { status: 404 },
    );
  }

  if (score.releasedAt && Date.now() < new Date(score.releasedAt.replace(" ", "T")).getTime()) {
    return NextResponse.json(
      { ok: false, error: "成绩暂未到开放查询时间" },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true, data: score });
}
