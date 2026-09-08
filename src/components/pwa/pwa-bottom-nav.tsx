"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/supabase/hooks";
import { getCart } from "@/server/cart";

export function PwaBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isPwa, setIsPwa] = useState(false);
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    // Strictly detect if running inside the installed PWA app (never inside a standard website browser)
    const checkIsPwa = (): boolean => {
      if (typeof window === "undefined") return false;

      // 1. iOS Safari standalone (Add to Home Screen app)
      if ((window.navigator as any).standalone === true) {
        return true;
      }

      // 2. Android Chrome / WebAPK / Windows standalone display modes
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches ||
        window.matchMedia("(display-mode: window-controls-overlay)").matches
      ) {
        return true;
      }

      // 3. Android TWA / APK wrapper
      if (document.referrer && document.referrer.includes("android-app://")) {
        return true;
      }

      // 4. Manifest start_url query parameter or preview parameter (?mode=pwa, ?source=pwa, ?pwa=1)
      const search = window.location.search;
      if (
        search.includes("mode=pwa") ||
        search.includes("source=pwa") ||
        search.includes("pwa=true") ||
        search.includes("pwa=1")
      ) {
        try {
          sessionStorage.setItem("cartigo_app_pwa", "true");
        } catch {}
        return true;
      }

      // 5. Persisted PWA session across route changes inside the PWA app
      try {
        if (sessionStorage.getItem("cartigo_app_pwa") === "true") {
          return true;
        }
      } catch {}

      return false;
    };

    const inPwa = checkIsPwa();
    setIsPwa(inPwa);

    if (inPwa) {
      document.documentElement.setAttribute("data-pwa", "true");
      document.body.classList.add("has-pwa-bottom-nav");
    } else {
      document.documentElement.removeAttribute("data-pwa");
      document.body.classList.remove("has-pwa-bottom-nav");
    }

    // Listen for display mode changes (e.g. app installed and launched)
    if (typeof window !== "undefined") {
      const mql = window.matchMedia("(display-mode: standalone)");
      const handleMediaChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          setIsPwa(true);
          document.documentElement.setAttribute("data-pwa", "true");
          document.body.classList.add("has-pwa-bottom-nav");
        }
      };

      if (mql.addEventListener) {
        mql.addEventListener("change", handleMediaChange);
        return () => mql.removeEventListener("change", handleMediaChange);
      }
    }
  }, []);

  // Fetch cart count for the badge
  useEffect(() => {
    if (session) {
      getCart()
        .then((cart) => {
          const total = cart.items.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(total);
        })
        .catch(() => setCartCount(0));
    } else {
      setCartCount(0);
    }
  }, [session, pathname]);

  // STRICT REQUIREMENT: If opened on website in a browser, DO NOT render!
  if (!isPwa) {
    return null;
  }

  const isHomeActive = pathname === "/";
  const isCategoriesActive = pathname.startsWith("/search");
  const isAccountActive =
    pathname.startsWith("/orders") ||
    pathname.startsWith("/reseller") ||
    pathname === "/login" ||
    pathname === "/signup";
  const isCartActive = pathname.startsWith("/cart") || pathname.startsWith("/checkout");

  const userRole = session?.user?.role;
  const accountHref = session?.user
    ? userRole === "SUPER_ADMIN" || userRole === "ADMIN"
      ? "/admin"
      : userRole === "APPROVED_RESELLER"
      ? "/reseller/dashboard"
      : "/orders"
    : "/login";

  return (
    <nav
      aria-label="PWA App Mobile Bottom Navigation"
      className="pwa-only-bottom-nav fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] select-none"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
      }}
    >
      <div className="grid grid-cols-4 items-center h-14 max-w-md mx-auto px-2">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-0.5 transition-colors active:scale-95 ${
            isHomeActive ? "text-[#0066ff]" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {isHomeActive ? (
            // Solid filled home icon matching screenshot
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2.69l5.66 5.66a1 1 0 01.34.71v9.94a1 1 0 01-1 1h-3a1 1 0 01-1-1v-4a1 1 0 00-1-1h-2a1 1 0 00-1 1v4a1 1 0 01-1 1H6a1 1 0 01-1-1V9.06a1 1 0 01.34-.71L12 2.69z" />
            </svg>
          ) : (
            // Outline home icon
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          )}
          <span className={`text-[11px] tracking-tight ${isHomeActive ? "font-semibold" : "font-medium"}`}>
            Home
          </span>
        </Link>

        {/* 2. Categories (4 rounded squares in 2x2 grid matching screenshot) */}
        <Link
          href="/search"
          className={`flex flex-col items-center justify-center gap-0.5 transition-colors active:scale-95 ${
            isCategoriesActive ? "text-[#0066ff]" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill={isCategoriesActive ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <rect x="3" y="3" width="7" height="7" rx="1.8" />
            <rect x="14" y="3" width="7" height="7" rx="1.8" />
            <rect x="14" y="14" width="7" height="7" rx="1.8" />
            <rect x="3" y="14" width="7" height="7" rx="1.8" />
          </svg>
          <span className={`text-[11px] tracking-tight ${isCategoriesActive ? "font-semibold" : "font-medium"}`}>
            Categories
          </span>
        </Link>

        {/* 3. Account (Person outline icon matching screenshot) */}
        <Link
          href={accountHref}
          className={`flex flex-col items-center justify-center gap-0.5 transition-colors active:scale-95 ${
            isAccountActive ? "text-[#0066ff]" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <circle cx="12" cy="7.5" r="4" />
            <path d="M5.5 20.5a6.5 6.5 0 0 1 13 0" />
          </svg>
          <span className={`text-[11px] tracking-tight ${isAccountActive ? "font-semibold" : "font-medium"}`}>
            Account
          </span>
        </Link>

        {/* 4. Cart (Shopping cart outline icon matching screenshot) */}
        <Link
          href="/cart"
          className={`relative flex flex-col items-center justify-center gap-0.5 transition-colors active:scale-95 ${
            isCartActive ? "text-[#0066ff]" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <circle cx="8.5" cy="20.5" r="1.5" />
              <circle cx="18.5" cy="20.5" r="1.5" />
              <path d="M2.5 3h3l2.4 12.2a1.8 1.8 0 0 0 1.8 1.5h8.6a1.8 1.8 0 0 0 1.8-1.4l1.6-7.8H6.5" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 rounded-full bg-[#0066ff] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </div>
          <span className={`text-[11px] tracking-tight ${isCartActive ? "font-semibold" : "font-medium"}`}>
            Cart
          </span>
        </Link>
      </div>
    </nav>
  );
}
