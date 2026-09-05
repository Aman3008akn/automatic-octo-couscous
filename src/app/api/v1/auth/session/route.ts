import { NextResponse } from "next/server";
import { requireSession } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireSession();
    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        resellerProfile: {
          select: {
            id: true,
            status: true,
            legalName: true,
          },
        },
        addresses: true,
      },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        resellerProfile: user.resellerProfile,
        addresses: user.addresses,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message || "Not authenticated" }, { status: 401 });
  }
}
