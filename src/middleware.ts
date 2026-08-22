import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin")) {
      const allowed = ["MODERATOR", "SUPPORT", "FINANCE", "ADMIN", "SUPER_ADMIN"];
      if (!role || !allowed.includes(role)) {
        return NextResponse.redirect(new URL("/403", req.url));
      }
    }

    if (path.startsWith("/reseller/dashboard")) {
      const allowed = ["APPROVED_RESELLER", "SUPER_ADMIN", "ADMIN"];
      if (!role || !allowed.includes(role)) {
        return NextResponse.redirect(new URL("/reseller/status", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/admin", "/admin/:path*", "/reseller/dashboard/:path*", "/account/:path*"],
};
