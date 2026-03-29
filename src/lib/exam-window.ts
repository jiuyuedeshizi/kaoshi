import type { ExamProject } from "@/lib/types";

function parsePortalDate(value: string) {
  return new Date(value.replace(" ", "T"));
}

export function isNowWithin(start: string, end: string) {
  const now = Date.now();
  return now >= parsePortalDate(start).getTime() && now <= parsePortalDate(end).getTime();
}

export function isReleasedAt(value: string) {
  return Date.now() >= parsePortalDate(value).getTime();
}

export function getRegistrationPhase(exam: ExamProject) {
  const now = Date.now();
  const start = parsePortalDate(exam.registrationStart).getTime();
  const end = parsePortalDate(exam.registrationEnd).getTime();

  if (now < start) return "upcoming" as const;
  if (now > end) return "closed" as const;
  return "open" as const;
}

export function getPaymentPhase(exam: ExamProject) {
  return isReleasedAt(exam.paymentEnd) ? "closed" : "open";
}

export function getTicketPhase(exam: ExamProject) {
  return isReleasedAt(exam.ticketStart) ? "open" : "upcoming";
}

export function getScorePhase(exam: ExamProject) {
  return isReleasedAt(exam.scoreReleaseAt) ? "open" : "upcoming";
}

export function getRegistrationLabel(exam: ExamProject) {
  const phase = getRegistrationPhase(exam);
  if (phase === "open") return "报名中";
  if (phase === "upcoming") return "即将报名";
  return "报名结束";
}
