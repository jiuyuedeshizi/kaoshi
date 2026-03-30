import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";
import {
  adminOperationLogs,
  applications,
  examProjects,
  notices,
  paymentOrders,
  scores,
  tickets,
  users,
} from "../src/lib/demo-data";

const prisma = new PrismaClient();

async function main() {
  await prisma.adminOperationLog.deleteMany();
  await prisma.adminSession.deleteMany();
  await prisma.scoreRecord.deleteMany();
  await prisma.admissionTicket.deleteMany();
  await prisma.paymentOrder.deleteMany();
  await prisma.application.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.examProject.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: users.map((user) => ({
      id: user.id,
      role: user.role,
      name: user.name,
      phone: user.phone,
      idCard: user.idCard,
      passwordHash: hashPassword(user.password),
      gender: user.gender,
      ethnicity: user.ethnicity,
      email: user.email,
      address: user.address,
      emergencyContact: user.emergencyContact,
    })),
  });

  await prisma.examProject.createMany({
    data: examProjects.map((exam) => ({
      id: exam.id,
      slug: exam.slug,
      title: exam.title,
      category: exam.category,
      location: exam.location,
      description: exam.description,
      registrationStart: new Date(exam.registrationStart.replace(" ", "T")),
      registrationEnd: new Date(exam.registrationEnd.replace(" ", "T")),
      reviewEnd: new Date(exam.reviewEnd.replace(" ", "T")),
      paymentEnd: new Date(exam.paymentEnd.replace(" ", "T")),
      ticketStart: new Date(exam.ticketStart.replace(" ", "T")),
      scoreReleaseAt: new Date(exam.scoreReleaseAt.replace(" ", "T")),
      fee: exam.fee,
      published: exam.published,
      admissionNotice: exam.admissionNotice,
    })),
  });

  await prisma.notice.createMany({
    data: notices.map((notice) => ({
      id: notice.id,
      title: notice.title,
      summary: notice.summary,
      body: notice.body,
      category: notice.category,
      pinned: notice.pinned,
      publishedAt: new Date(`${notice.publishedAt}T00:00:00`),
    })),
  });

  await prisma.application.createMany({
    data: applications.map((application) => ({
      id: application.id,
      examProjectId: application.examProjectId,
      userId: application.userId,
      status: application.status,
      major: application.major,
      education: application.education,
      employer: application.employer,
      photoUrl: application.photoUrl,
      documents: application.documents,
      reviewNote: application.reviewNote,
      submittedAt: application.submittedAt ? new Date(application.submittedAt.replace(" ", "T")) : null,
      approvedAt: application.approvedAt ? new Date(application.approvedAt.replace(" ", "T")) : null,
      createdAt: new Date(application.createdAt.replace(" ", "T")),
    })),
  });

  await prisma.paymentOrder.createMany({
    data: paymentOrders.map((order) => ({
      id: order.id,
      orderNo: order.orderNo,
      applicationId: order.applicationId,
      amount: order.amount,
      provider: order.provider,
      status: order.status,
      callbackPayload: order.callbackPayload,
      createdAt: new Date(order.createdAt.replace(" ", "T")),
      paidAt: order.paidAt ? new Date(order.paidAt.replace(" ", "T")) : null,
    })),
  });

  await prisma.admissionTicket.createMany({
    data: tickets.map((ticket) => ({
      id: ticket.id,
      applicationId: ticket.applicationId,
      ticketNo: ticket.ticketNo,
      examTime: new Date(ticket.examTime.replace(" ", "T")),
      venue: ticket.venue,
      room: ticket.room,
      seatNo: ticket.seatNo,
      templateVersion: ticket.templateVersion,
      printedAt: ticket.printedAt ? new Date(ticket.printedAt.replace(" ", "T")) : null,
    })),
  });

  await prisma.scoreRecord.createMany({
    data: scores.map((score) => ({
      id: score.id,
      applicationId: score.applicationId,
      ticketNo: score.ticketNo,
      idCard: score.idCard,
      score: score.score,
      ranking: score.ranking,
      published: score.published,
      queryNote: score.queryNote,
      releasedAt: score.releasedAt ? new Date(score.releasedAt.replace(" ", "T")) : null,
    })),
  });

  await prisma.adminOperationLog.createMany({
    data: adminOperationLogs.map((log) => ({
      id: log.id,
      adminUserId: log.adminUserId,
      adminName: log.adminName,
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      detail: log.detail,
      createdAt: new Date(log.createdAt.replace(" ", "T")),
    })),
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
