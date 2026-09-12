import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  "cartigo-secret-dev-key-random-string-12345";

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL =
    process.env.URL ||
    (process.env.NODE_ENV === "production"
      ? "https://cartygo.netlify.app"
      : "http://localhost:3000");
}

/**
 * Central auth config. Role lives on the User row (see prisma/schema.prisma).
 * Route-level authorization is enforced in middleware.ts and again inside
 * each server action / API route — never trust the client-side role alone.
 */
export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    ...(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const inputEmail = credentials.email.toLowerCase();
        let user = await prisma.user.findUnique({
          where: { email: inputEmail },
        });

        // Backward compatibility fallback between cartygo and cartigo
        if (!user && inputEmail.includes("@cartygo.admin")) {
          user = await prisma.user.findUnique({
            where: { email: inputEmail.replace("@cartygo.admin", "@cartigo.admin") },
          });
        }
        if (!user && inputEmail.includes("@cartigo.admin")) {
          user = await prisma.user.findUnique({
            where: { email: inputEmail.replace("@cartigo.admin", "@cartygo.admin") },
          });
        }
        if (!user || !user.passwordHash || user.deletedAt) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const inputEmail = user.email.toLowerCase();
        try {
          let dbUser = await prisma.user.findUnique({
            where: { email: inputEmail },
          });
          if (!dbUser) {
            await prisma.user.create({
              data: {
                email: inputEmail,
                name: user.name || inputEmail.split("@")[0],
                role: "CUSTOMER",
              },
            });
          }
        } catch (err) {
          console.error("Error creating user during Google sign in:", err);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        const email = (user.email || token.email)?.toLowerCase();
        if (email) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email },
              select: { id: true, role: true, name: true },
            });
            if (dbUser) {
              token.uid = dbUser.id;
              token.role = dbUser.role;
              if (dbUser.name) token.name = dbUser.name;
            }
          } catch {
            token.role = (user as { role?: string }).role || "CUSTOMER";
            token.uid = user.id;
          }
        } else {
          token.role = (user as { role?: string }).role || "CUSTOMER";
          token.uid = user.id;
        }
      } else if (token.uid) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.uid as string },
            select: { role: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
          }
        } catch {
          // fallback to cached token role
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; id?: string }).role = token.role as string;
        (session.user as { role?: string; id?: string }).id = token.uid as string;
      }
      return session;
    },
  },
};
