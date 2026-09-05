import { NextResponse } from "next/server";
import { getCart, addToCart, updateCartItemQuantity, removeFromCart } from "@/server/cart";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";

export async function GET() {
  try {
    const cart = await getCart();
    return NextResponse.json({ ok: true, data: cart });
  } catch (error: any) {
    // If not signed in or error, return empty cart gracefully
    return NextResponse.json({
      ok: true,
      data: {
        id: null,
        items: [],
        subtotalCents: 0,
        shippingCents: 0,
        taxCents: 0,
        totalCents: 0,
      },
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { variantId, quantity = 1 } = body;

    if (!variantId) {
      return NextResponse.json({ ok: false, error: "variantId is required" }, { status: 400 });
    }

    const res = await addToCart(variantId, quantity);
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
    }

    const cart = await getCart();
    return NextResponse.json({ ok: true, data: cart });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to add to cart" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { cartItemId, quantity } = body;

    if (!cartItemId || quantity === undefined) {
      return NextResponse.json({ ok: false, error: "cartItemId and quantity are required" }, { status: 400 });
    }

    const res = await updateCartItemQuantity(cartItemId, quantity);
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
    }

    const cart = await getCart();
    return NextResponse.json({ ok: true, data: cart });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get("cartItemId");

    if (cartItemId) {
      const res = await removeFromCart(cartItemId);
      if (!res.ok) {
        return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
      }
    } else {
      const session = await requireSession();
      await prisma.cartItem.deleteMany({
        where: { cart: { userId: session.user.id } },
      });
    }

    const cart = await getCart();
    return NextResponse.json({ ok: true, data: cart });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to remove item" }, { status: 500 });
  }
}
