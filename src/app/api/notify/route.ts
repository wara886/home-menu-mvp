import { NextResponse } from "next/server";

interface NotifyRequestBody {
  customerName?: string;
  items: Array<{ name: string; quantity: number }>;
  remark?: string;
  orderId: string;
}

export async function POST(request: Request) {
  const barkKey = process.env.BARK_KEY;

  if (!barkKey) {
    // Bark 未配置，静默跳过
    return NextResponse.json({ ok: true, skipped: true });
  }

  let body: NotifyRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const itemCount = body.items.reduce((sum, item) => sum + item.quantity, 0);
  const itemNames = body.items.map((item) => item.name).join("、");
  const title = "🍳 新订单";
  const bodyText = [
    `${body.customerName ?? "家里人"} 点了 ${itemCount} 道菜`,
    itemNames ? `菜品：${itemNames}` : "",
    body.remark ? `备注：${body.remark}` : "",
    `#${body.orderId.slice(0, 8)}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const encodedTitle = encodeURIComponent(title);
    const encodedBody = encodeURIComponent(bodyText);
    const url = `https://api.day.app/${barkKey}/${encodedBody}?title=${encodedTitle}&group=HomeMenu&icon=https%3A%2F%2Fapi.iconify.design%2Flucide%2Futensils-crossed.svg%3Fcolor%3D%252316a34a`;

    const res = await fetch(url, { method: "GET" });

    if (!res.ok) {
      console.error("Bark notification failed:", res.status, await res.text());
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Bark notification error:", error);
    // 通知失败不影响订单
    return NextResponse.json({ ok: true, notified: false });
  }
}
