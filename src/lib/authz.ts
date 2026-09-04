import { createClient } from "./supabase/server";
import { prisma } from "./prisma";
import type { Role } from "@prisma/client";

export class UnauthorizedError extends Error {
  code = "UNAUTHORIZED";
}
export class ForbiddenError extends Error {
  code = "FORBIDDEN";
}

export async function requireSession() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user?.id) throw new UnauthorizedError("Sign in required.");
  
  let dbUser = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (!dbUser && user.email) {
    try {
      dbUser = await prisma.user.create({
        data: {
          email: user.email,
          name: user.user_metadata?.name || user.user_metadata?.full_name || user.email.split('@')[0],
          role: "CUSTOMER",
        },
      });
    } catch {
      dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });
    }
  }

  if (!dbUser) throw new UnauthorizedError("User profile not found in database.");

  return {
    user: {
      id: dbUser.id, // Return MongoDB id for compatibility with existing code
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as Role,
      supabaseId: user.id,
    },
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
