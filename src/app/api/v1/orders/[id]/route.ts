import { NextResponse } from "next/server";
import { getOrderById, cancelOrder } from "@/server/orders";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to load order" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await cancelOrder(id);

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: "Order cancelled successfully" });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to cancel order" }, { status: 500 });
  }
}
