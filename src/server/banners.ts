"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { revalidatePath } from "next/cache";

export async function getBanners(position?: string) {
  try {
    const whereClause = position ? { position, isActive: true } : {};
    const banners = await prisma.banner.findMany({
      where: whereClause,
      orderBy: { order: "asc" },
    });
    return banners;
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
}

export async function getAllBannersAdmin() {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"]);
    return await prisma.banner.findMany({
      orderBy: [{ position: "asc" }, { order: "asc" }],
    });
  } catch (error) {
    console.error("Error in getAllBannersAdmin:", error);
    return [];
  }
}

export async function createBanner(data: {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position: string;
  isActive: boolean;
  order: number;
}) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"]);
    const banner = await prisma.banner.create({
      data,
    });
    revalidatePath("/");
    revalidatePath("/admin/banners");
    return { ok: true, data: banner };
  } catch (error: any) {
    console.error("Error creating banner:", error);
    return { ok: false, error: error.message };
  }
}

export async function toggleBannerActive(id: string, isActive: boolean) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"]);
    await prisma.banner.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/");
    revalidatePath("/admin/banners");
    return { ok: true };
  } catch (error: any) {
    console.error("Error toggling banner:", error);
    return { ok: false, error: error.message };
  }
}

export async function deleteBanner(id: string) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"]);
    await prisma.banner.delete({
      where: { id },
    });
    revalidatePath("/");
    revalidatePath("/admin/banners");
    return { ok: true };
  } catch (error: any) {
    console.error("Error deleting banner:", error);
    return { ok: false, error: error.message };
  }
}
