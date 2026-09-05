import { NextResponse } from "next/server";
import { getMyOrders, createOrderFromCart } from "@/server/orders";

export async function GET() {
  try {
    const orders = await getMyOrders();
    return NextResponse.json({ ok: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await createOrderFromCart(body);

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: res.error, code: res.code }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data: res });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to place order" }, { status: 500 });
  }
}
