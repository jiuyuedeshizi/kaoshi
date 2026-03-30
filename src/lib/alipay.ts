import fs from "node:fs";
import { createPrivateKey, createPublicKey } from "node:crypto";
import { AlipaySdk } from "alipay-sdk";
import type { ExamProject, PaymentOrder } from "@/lib/types";

function normalizePem(value?: string) {
  return value?.replace(/\\n/g, "\n").trim();
}

function wrapPemBlock(content: string, blockName: string) {
  const compact = content.replace(/\s+/g, "");
  const lines = compact.match(/.{1,64}/g) ?? [compact];
  return `-----BEGIN ${blockName}-----\n${lines.join("\n")}\n-----END ${blockName}-----`;
}

function normalizePrivateKeyContent(content: string) {
  const normalized = content.trim();
  if (normalized.startsWith("-----BEGIN ")) {
    return normalized;
  }

  const der = Buffer.from(normalized.replace(/\s+/g, ""), "base64");
  for (const type of ["pkcs8", "pkcs1"] as const) {
    try {
      return createPrivateKey({ key: der, format: "der", type }).export({
        format: "pem",
        type: "pkcs8",
      }).toString();
    } catch {
      // try next format
    }
  }

  return wrapPemBlock(normalized, "PRIVATE KEY");
}

function normalizePublicKeyContent(content: string) {
  const normalized = content.trim();
  if (normalized.startsWith("-----BEGIN ")) {
    return normalized;
  }

  try {
    return createPublicKey({
      key: Buffer.from(normalized.replace(/\s+/g, ""), "base64"),
      format: "der",
      type: "spki",
    }).export({
      format: "pem",
      type: "spki",
    }).toString();
  } catch {
    return wrapPemBlock(normalized, "PUBLIC KEY");
  }
}

function resolveMaybeFileContent(
  value?: string,
  options?: { pathOnly?: boolean; blockName?: string; keyKind?: "private" | "public" },
) {
  const normalized = value?.trim();
  if (!normalized) {
    return undefined;
  }

  if (normalized.startsWith("-----BEGIN ")) {
    return normalizePem(normalized);
  }

  if (fs.existsSync(normalized)) {
    const fileContent = fs.readFileSync(normalized, "utf8").trim();
    if (fileContent.startsWith("-----BEGIN ")) {
      return normalizePem(fileContent);
    }
    if (options?.keyKind === "private") {
      return normalizePrivateKeyContent(fileContent);
    }
    if (options?.keyKind === "public") {
      return normalizePublicKeyContent(fileContent);
    }
    return options?.blockName ? wrapPemBlock(fileContent, options.blockName) : fileContent;
  }

  if (options?.pathOnly) {
    return undefined;
  }

  if (options?.keyKind === "private") {
    return normalizePrivateKeyContent(normalized);
  }
  if (options?.keyKind === "public") {
    return normalizePublicKeyContent(normalized);
  }
  return options?.blockName ? wrapPemBlock(normalized, options.blockName) : normalizePem(normalized);
}

function getRequiredAlipayConfig() {
  const appId = process.env.ALIPAY_APP_ID?.trim();
  const privateKey =
    resolveMaybeFileContent(process.env.ALIPAY_PRIVATE_KEY_PATH, { pathOnly: true, keyKind: "private" }) ??
    resolveMaybeFileContent(process.env.ALIPAY_PRIVATE_KEY, { keyKind: "private" });
  const alipayPublicKey =
    resolveMaybeFileContent(process.env.ALIPAY_PUBLIC_KEY_PATH, { pathOnly: true, keyKind: "public" }) ??
    resolveMaybeFileContent(process.env.ALIPAY_PUBLIC_KEY, { keyKind: "public" });

  if (!appId || !privateKey) {
    return null;
  }

  return {
    appId,
    privateKey,
    alipayPublicKey: alipayPublicKey ?? "",
    gateway: process.env.ALIPAY_GATEWAY?.trim() || "https://openapi.alipay.com/gateway.do",
    keyType: (process.env.ALIPAY_KEY_TYPE?.trim() || "PKCS8") as "PKCS1" | "PKCS8",
  };
}

export function isAlipayConfigured() {
  return Boolean(getRequiredAlipayConfig());
}

export function getAlipayClient() {
  const config = getRequiredAlipayConfig();
  if (!config) {
    return null;
  }

  return new AlipaySdk({
    appId: config.appId,
    privateKey: config.privateKey,
    alipayPublicKey: config.alipayPublicKey,
    gateway: config.gateway,
    keyType: config.keyType,
    signType: "RSA2",
  });
}

export function resolveRequestOrigin(request: Request) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host");
  const protocol = forwardedProto || (host?.includes("localhost") || host?.startsWith("127.") ? "http" : "https");

  if (host) {
    return `${protocol}://${host}`;
  }

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export function getAlipayNotifyUrl(request: Request) {
  return process.env.ALIPAY_NOTIFY_URL?.trim() || `${resolveRequestOrigin(request)}/api/payments/callback/ALIPAY`;
}

export function getAlipayReturnUrl(request: Request) {
  return process.env.ALIPAY_RETURN_URL?.trim() || `${resolveRequestOrigin(request)}/api/payments/alipay/return`;
}

export function buildAlipayPagePayUrl({
  request,
  order,
  exam,
  applicationId,
}: {
  request: Request;
  order: PaymentOrder;
  exam: ExamProject;
  applicationId: string;
}) {
  const alipay = getAlipayClient();
  if (!alipay) {
    throw new Error("支付宝参数未配置，请先在 .env.local 中填写 ALIPAY_APP_ID、ALIPAY_PRIVATE_KEY、ALIPAY_PUBLIC_KEY。");
  }

  return alipay.pageExecute("alipay.trade.page.pay", "GET", {
    notifyUrl: getAlipayNotifyUrl(request),
    returnUrl: getAlipayReturnUrl(request),
    bizContent: {
      outTradeNo: order.orderNo,
      productCode: "FAST_INSTANT_TRADE_PAY",
      totalAmount: order.amount.toFixed(2),
      subject: `${exam.title} 报名缴费`,
      body: `报名单号：${applicationId}`,
    },
  });
}

export async function createAlipayQrCode({
  request,
  order,
  exam,
  applicationId,
}: {
  request: Request;
  order: PaymentOrder;
  exam: ExamProject;
  applicationId: string;
}) {
  const alipay = getAlipayClient();
  if (!alipay) {
    throw new Error("支付宝参数未配置，请先在 .env.local 中填写 ALIPAY_APP_ID、ALIPAY_PRIVATE_KEY、ALIPAY_PUBLIC_KEY。");
  }

  const result = await alipay.exec("alipay.trade.precreate", {
    notifyUrl: getAlipayNotifyUrl(request),
    bizContent: {
      outTradeNo: order.orderNo,
      totalAmount: order.amount.toFixed(2),
      subject: `${exam.title} 报名缴费`,
      body: `报名单号：${applicationId}`,
    },
  }, {
    validateSign: false,
  });

  const qrCode = ("qrCode" in result ? result.qrCode : undefined) || ("qr_code" in result ? result.qr_code : undefined);

  if (result.code !== "10000" || !qrCode) {
    throw new Error(result.sub_msg || result.msg || "支付宝预下单失败。");
  }

  return {
    qrCode: qrCode as string,
  };
}

export async function queryAlipayTrade(orderNo: string) {
  const alipay = getAlipayClient();
  if (!alipay) {
    throw new Error("支付宝参数未配置，请先在 .env.local 中填写支付参数。");
  }

  const result = await alipay.exec("alipay.trade.query", {
    bizContent: {
      outTradeNo: orderNo,
    },
  }, {
    validateSign: false,
  });

  if (result.code !== "10000") {
    throw new Error(result.sub_msg || result.msg || "支付宝查单失败。");
  }

  return {
    tradeStatus: ("tradeStatus" in result ? result.tradeStatus : result.trade_status) as string | undefined,
    tradeNo: ("tradeNo" in result ? result.tradeNo : result.trade_no) as string | undefined,
    buyerLogonId: ("buyerLogonId" in result ? result.buyerLogonId : result.buyer_logon_id) as string | undefined,
    raw: result,
  };
}

export function verifyAlipayParams(params: Record<string, string>) {
  const alipay = getAlipayClient();
  const config = getRequiredAlipayConfig();
  if (!alipay || !config?.alipayPublicKey) {
    return false;
  }

  return alipay.checkNotifySignV2(params);
}
