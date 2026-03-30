import fs from "node:fs";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";
import {
  TICKET_NOTICE_ITEMS,
  buildTicketArrivalTip,
  buildTicketSubjectName,
  buildTicketVenueHint,
} from "@/lib/ticket-template";
import type { AdmissionTicket, Application, ExamProject, User } from "@/lib/types";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 28;
const BLACK = rgb(0.12, 0.12, 0.12);
const LIGHT = rgb(0.96, 0.97, 0.99);

const FONT_CANDIDATES = [
  "/Library/Fonts/Arial Unicode.ttf",
  "/System/Library/Fonts/STHeiti Light.ttc",
  "/System/Library/Fonts/Supplemental/Songti.ttc",
];

interface TicketPdfPayload {
  ticket: AdmissionTicket;
  application: Application;
  candidate: User;
  exam: ExamProject;
}

function resolveFontPath() {
  for (const fontPath of FONT_CANDIDATES) {
    if (fs.existsSync(fontPath)) {
      return fontPath;
    }
  }

  return null;
}

function resolvePhotoPath(photoUrl?: string) {
  if (!photoUrl || !photoUrl.startsWith("/")) {
    return null;
  }

  const absolutePath = path.join(process.cwd(), "public", photoUrl.replace(/^\/+/, ""));
  return fs.existsSync(absolutePath) ? absolutePath : null;
}

function drawText(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  y: number,
  size: number,
  options?: { color?: ReturnType<typeof rgb> },
) {
  page.drawText(text, {
    x,
    y,
    size,
    font,
    color: options?.color ?? BLACK,
  });
}

function drawCentered(page: PDFPage, font: PDFFont, text: string, y: number, size: number) {
  const width = font.widthOfTextAtSize(text, size);
  drawText(page, font, text, (PAGE_WIDTH - width) / 2, y, size);
}

function wrapText(font: PDFFont, text: string, size: number, maxWidth: number) {
  const lines: string[] = [];
  let current = "";

  for (const char of text) {
    const next = current + char;
    if (font.widthOfTextAtSize(next, size) <= maxWidth || current.length === 0) {
      current = next;
    } else {
      lines.push(current);
      current = char;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function drawWrappedBlock(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  y: number,
  width: number,
  size: number,
  lineHeight: number,
) {
  const lines = wrapText(font, text, size, width);
  lines.forEach((line, index) => {
    drawText(page, font, line, x, y - index * lineHeight, size);
  });
}

function getWrappedBlockHeight(font: PDFFont, text: string, size: number, maxWidth: number, lineHeight: number) {
  const lines = wrapText(font, text, size, maxWidth);
  return lines.length * lineHeight;
}

function drawCenteredWrappedBlock(
  page: PDFPage,
  font: PDFFont,
  text: string,
  y: number,
  width: number,
  size: number,
  lineHeight: number,
) {
  const lines = wrapText(font, text, size, width);
  lines.forEach((line, index) => {
    const lineWidth = font.widthOfTextAtSize(line, size);
    drawText(page, font, line, (PAGE_WIDTH - lineWidth) / 2, y - index * lineHeight, size);
  });
}

function drawCell(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  yTop: number,
  width: number,
  height: number,
  size = 10.5,
  center = true,
) {
  page.drawRectangle({
    x,
    y: yTop - height,
    width,
    height,
    borderColor: BLACK,
    borderWidth: 1,
  });

  const lines = wrapText(font, text, size, width - 10);
  const totalHeight = lines.length * (size + 2);
  let lineY = yTop - (height - totalHeight) / 2 - size;

  lines.forEach((line) => {
    const textWidth = font.widthOfTextAtSize(line, size);
    drawText(
      page,
      font,
      line,
      center ? x + (width - textWidth) / 2 : x + 6,
      lineY,
      size,
    );
    lineY -= size + 2;
  });
}

export async function generateTicketPdf(payload: TicketPdfPayload) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  const fontPath = resolveFontPath();
  const regularFont = fontPath
    ? await pdfDoc.embedFont(fs.readFileSync(fontPath), { subset: true })
    : await pdfDoc.embedFont(StandardFonts.Helvetica);

  const boldFont = regularFont;

  drawText(page, regularFont, new Date().toLocaleString("zh-CN", { hour12: false }), MARGIN, PAGE_HEIGHT - 24, 9.5);
  drawCentered(page, regularFont, "邻泰考生网上报名系统", PAGE_HEIGHT - 24, 10);

  drawCenteredWrappedBlock(page, boldFont, payload.exam.title, PAGE_HEIGHT - 66, PAGE_WIDTH - 160, 18, 23);
  drawCentered(page, boldFont, "准 考 证", PAGE_HEIGHT - 138, 24);

  const startX = MARGIN;
  let yTop = PAGE_HEIGHT - 170;
  const labelWidth = 82;
  const valueWidth = 128;
  const photoWidth = 105;
  const rowHeight = 30;
  const textTableWidth = PAGE_WIDTH - MARGIN * 2 - photoWidth;

  const infoRows = [
    ["报名序号", payload.application.id, "所属考区", payload.exam.location],
    ["考生姓名", payload.candidate.name, "性别", payload.candidate.gender ?? "男"],
    ["身份证号", payload.candidate.idCard, "民族", payload.candidate.ethnicity ?? "-"],
    ["岗位代码", payload.ticket.ticketNo.slice(-8), "笔试类别", payload.application.major],
    ["岗位名称", payload.application.major, "", ""],
  ];

  infoRows.forEach((row, index) => {
    if (index < 4) {
      drawCell(page, regularFont, row[0], startX, yTop, labelWidth, rowHeight);
      drawCell(page, regularFont, row[1], startX + labelWidth, yTop, valueWidth, rowHeight, 10.5, false);
      drawCell(page, regularFont, row[2], startX + labelWidth + valueWidth, yTop, labelWidth, rowHeight);
      drawCell(
        page,
        regularFont,
        row[3],
        startX + labelWidth + valueWidth + labelWidth,
        yTop,
        textTableWidth - labelWidth - valueWidth - labelWidth,
        rowHeight,
        10.5,
        false,
      );
    } else {
      drawCell(page, regularFont, row[0], startX, yTop, labelWidth, rowHeight);
      drawCell(page, regularFont, row[1], startX + labelWidth, yTop, textTableWidth - labelWidth, rowHeight, 10.5, false);
    }
    yTop -= rowHeight;
  });

  page.drawRectangle({
    x: startX + textTableWidth,
    y: PAGE_HEIGHT - 170 - rowHeight * 5,
    width: photoWidth,
    height: rowHeight * 5,
    borderColor: BLACK,
    borderWidth: 1,
  });

  const photoPath = resolvePhotoPath(payload.application.photoUrl);
  if (photoPath) {
    try {
      const photoBytes = fs.readFileSync(photoPath);
      const image = photoPath.toLowerCase().endsWith(".png")
        ? await pdfDoc.embedPng(photoBytes)
        : await pdfDoc.embedJpg(photoBytes);
      page.drawImage(image, {
        x: startX + textTableWidth + 8,
        y: PAGE_HEIGHT - 170 - rowHeight * 5 + 10,
        width: photoWidth - 16,
        height: rowHeight * 5 - 20,
      });
    } catch {
      // Leave the photo area blank if the uploaded image cannot be parsed.
    }
  }

  drawCell(page, boldFont, "考 场 信 息", startX, yTop, PAGE_WIDTH - MARGIN * 2, 26, 12);
  yTop -= 26;

  const columns = [96, 108, 118, 138, 40, 39];
  const headers = ["准考证号", "考试科目", "考试时间", "考点名称", "考场", "座位"];
  let x = startX;
  headers.forEach((header, index) => {
    drawCell(page, regularFont, header, x, yTop, columns[index], 28, 10.5);
    x += columns[index];
  });

  yTop -= 28;
  x = startX;
  const values = [
    payload.ticket.ticketNo,
    buildTicketSubjectName(payload.application.major),
    buildTicketArrivalTip(payload.ticket.examTime),
    payload.ticket.venue,
    payload.ticket.room,
    payload.ticket.seatNo,
  ];
  values.forEach((value, index) => {
    drawCell(page, regularFont, value, x, yTop, columns[index], 58, 10, index === 0);
    x += columns[index];
  });

  yTop -= 58;
  drawCell(
    page,
    regularFont,
    buildTicketVenueHint(payload.ticket.venue),
    startX,
    yTop,
    PAGE_WIDTH - MARGIN * 2,
    28,
    10,
    false,
  );

  yTop -= 28;
  drawCell(page, boldFont, "注 意 事 项", startX, yTop, PAGE_WIDTH - MARGIN * 2, 26, 12);
  yTop -= 26;

  const noticeFontSize = 9.5;
  const noticeLineHeight = 12.5;
  const noticeGap = 2;
  const noticeContentWidth = PAGE_WIDTH - MARGIN * 2 - 20;
  const noticeHeight = TICKET_NOTICE_ITEMS.reduce((total, item) => {
    return total + getWrappedBlockHeight(regularFont, item, noticeFontSize, noticeContentWidth, noticeLineHeight) + noticeGap;
  }, 16);
  page.drawRectangle({
    x: startX,
    y: yTop - noticeHeight,
    width: PAGE_WIDTH - MARGIN * 2,
    height: noticeHeight,
    borderColor: BLACK,
    borderWidth: 1,
    color: LIGHT,
    opacity: 0.2,
  });
  page.drawRectangle({
    x: startX,
    y: yTop - noticeHeight,
    width: PAGE_WIDTH - MARGIN * 2,
    height: noticeHeight,
    borderColor: BLACK,
    borderWidth: 1,
  });

  let noticeY = yTop - 16;
  TICKET_NOTICE_ITEMS.forEach((item) => {
    const blockHeight = getWrappedBlockHeight(regularFont, item, noticeFontSize, noticeContentWidth, noticeLineHeight);
    drawWrappedBlock(page, regularFont, item, startX + 10, noticeY, noticeContentWidth, noticeFontSize, noticeLineHeight);
    noticeY -= blockHeight + noticeGap;
  });

  return Buffer.from(await pdfDoc.save());
}
