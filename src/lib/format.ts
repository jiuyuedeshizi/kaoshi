export function formatMoney(value: number) {
  return `¥${value.toFixed(2)}`;
}

export function paymentProviderLabel(provider: string) {
  const map: Record<string, string> = {
    MOCK: "模拟支付",
    WECHAT: "微信支付",
    ALIPAY: "支付宝",
  };

  return map[provider] ?? provider;
}

export function statusTone(status: string) {
  switch (status) {
    case "PAID":
    case "TICKET_READY":
    case "FINISHED":
    case "APPROVED":
      return "success";
    case "REJECTED":
    case "FAILED":
      return "danger";
    case "SUBMITTED":
    case "PENDING":
      return "warning";
    default:
      return "";
  }
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    DRAFT: "草稿",
    SUBMITTED: "待审核",
    APPROVED: "已通过",
    REJECTED: "已驳回",
    PAID: "已缴费",
    TICKET_READY: "可打印准考证",
    FINISHED: "已结束",
    PENDING: "待支付",
    FAILED: "支付失败",
    CLOSED: "已关闭",
  };

  return map[status] ?? status;
}
