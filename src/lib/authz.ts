import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import type { Role } from "@prisma/client";

export class UnauthorizedError extends Error {
  code = "UNAUTHORIZED";
}
export class ForbiddenError extends Error {
  code = "FORBIDDEN";
}

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError("Sign in required.");
  return session as {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role?: Role;
    };
  };
}

/** Throws unless the signed-in user's role is one of `roles`. */
export async function requireRole(roles: Role[]) {
  const session = await requireSession();
  const role = session.user.role;
  if (!role || !roles.includes(role)) {
    throw new ForbiddenError("You don't have permission to do that.");
  }
  return session;
}
