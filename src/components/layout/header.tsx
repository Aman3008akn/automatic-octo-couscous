"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { getCart } from "@/server/cart";
import { getSearchSuggestions } from "@/server/search";
import { StatusBadge } from "@/components/ui/status-badge";
import { CartigoLogoIcon } from "@/components/ui/cartigo-logo";

const CATEGORIES_STRIP = [
  { name: "Electronics", slug: "electronics" },
  { name: "Mobiles & Tablets", slug: "mobiles-tablets" },
  { name: "Computers & Laptops", slug: "computers-laptops" },
  { name: "Home & Kitchen", slug: "home-kitchen" },
  { name: "Fashion & Apparel", slug: "fashion-apparel" },
  { name: "Beauty & Care", slug: "beauty-care" },
  { name: "Sports & Fitness", slug: "sports-fitness" },
  { name: "Gaming & Consoles", slug: "gaming" },
  { name: "Today's Deals", slug: "deals" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const [cartCount, setCartCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [suggestions, setSuggestions] = useState<{ title: string; slug: string; categoryName: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session) {
      getCart()
        .then((res) => setCartCount(res.items.reduce((sum, i) => sum + i.quantity, 0)))
        .catch(() => setCartCount(0));
    }
  }, [session, pathname]);

  // Autocomplete fetch on query change
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      getSearchSuggestions(searchQuery).then((res) => {
        setSuggestions(res);
        setShowSuggestions(true);
      });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      const cat = selectedCategory !== "all" ? `&categorySlug=${selectedCategory}` : "";
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}${cat}`);
    }
  }

  const role = (session?.user as { role?: string })?.role;
  const isAdmin = ["MODERATOR", "SUPPORT", "FINANCE", "ADMIN", "SUPER_ADMIN"].includes(role ?? "");

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/98 backdrop-blur-md shadow-sm">
      {/* 1. Top Utility Announcement Bar */}
      <div className="bg-navy-900 text-white text-[11px] py-1.5 px-4 sm:px-8 flex items-center justify-between font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse"></span>
            Deliver to: <strong className="text-amber-400 font-semibold">India (INR ₹)</strong>
          </span>
          <span className="hidden md:inline text-navy-400">|</span>
          <span className="hidden md:inline text-navy-100">Free Express Shipping on Orders Over ₹999</span>
        </div>

        <div className="flex items-center gap-4 text-navy-100">
          <Link href="/reseller" className="hover:text-amber-400 transition-colors">
            Sell on Cartigo
          </Link>
          <span>•</span>
          <Link href="/orders" className="hover:text-amber-400 transition-colors">
            Track Order
          </Link>
        </div>
      </div>

      {/* 2. Main Marketplace Header Bar */}
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-2.5">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5 shrink-0">
          <CartigoLogoIcon className="h-10 w-10 transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="font-display text-2xl font-bold tracking-tight text-ink leading-none">
              Cartigo
            </span>
            <span className="text-[10px] font-mono font-medium text-navy-600 tracking-wider">
              VERIFIED MARKETPLACE
            </span>
          </div>
        </Link>

        {/* Prominent Center Search Engine Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-2xl mx-2 hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="flex items-center rounded-card border border-navy-600/30 bg-white shadow-sm focus-within:border-navy-900 focus-within:ring-2 focus-within:ring-navy-400/30 overflow-hidden">
            {/* Category Filter Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-navy-50/70 border-r border-line text-xs font-semibold text-ink px-3 py-2.5 outline-none cursor-pointer hover:bg-navy-100/60 transition-colors"
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="mobiles-tablets">Mobiles & Tablets</option>
              <option value="computers-laptops">Computers</option>
              <option value="home-kitchen">Home & Kitchen</option>
              <option value="fashion-apparel">Fashion</option>
              <option value="beauty-care">Beauty</option>
              <option value="sports-fitness">Sports</option>
              <option value="gaming">Gaming</option>
            </select>

            {/* Search Input Field */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              placeholder="Search products, brands and categories..."
              className="w-full px-4 py-2 text-sm text-ink outline-none placeholder:text-navy-400"
            />

            {/* Search Submit Button */}
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-navy-900 font-bold px-5 py-2.5 flex items-center justify-center transition-colors"
              aria-label="Search Marketplace"
            >
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Autocomplete Dropdown Popover */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-card border border-line bg-white shadow-lg z-50 overflow-hidden divide-y divide-line">
              {suggestions.map((item) => (
                <Link
                  key={item.slug}
                  href={`/products/${item.slug}`}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center justify-between p-3 text-xs hover:bg-navy-50 transition-colors"
                >
                  <span className="font-semibold text-ink">{item.title}</span>
                  <span className="font-mono text-[10px] bg-navy-50 text-navy-600 px-2 py-0.5 rounded">
                    {item.categoryName}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Account & Shopping Actions */}
        <div className="flex items-center gap-4">
          {/* Account Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="flex items-center gap-1.5 rounded-card border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-navy-50 transition-colors"
            >
              <div className="text-left hidden md:block">
                <p className="text-[10px] uppercase text-navy-400 font-mono">
                  {session ? "Welcome back" : "Hello, Sign In"}
                </p>
                <p className="font-bold text-ink text-xs line-clamp-1">
                  {session?.user?.name || session?.user?.email || "Account & Orders ▾"}
                </p>
              </div>
              <span className="md:hidden">👤 Account</span>
            </button>

            {accountMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-card border border-line bg-white p-2 shadow-xl z-50 text-xs divide-y divide-line">
                {session ? (
                  <>
                    <div className="p-2">
                      <p className="font-bold text-ink">{session.user?.name}</p>
                      <p className="text-navy-400 font-mono text-[11px]">{session.user?.email}</p>
                      <div className="mt-1">
                        <StatusBadge status={role ?? "CUSTOMER"} />
                      </div>
                    </div>
                    <div className="py-1">
                      <Link href="/orders" onClick={() => setAccountMenuOpen(false)} className="block px-3 py-1.5 hover:bg-navy-50 font-medium text-ink">
                        📦 My Orders
                      </Link>
                      <Link href="/reseller" onClick={() => setAccountMenuOpen(false)} className="block px-3 py-1.5 hover:bg-navy-50 font-medium text-ink">
                        🤝 Reseller Program
                      </Link>
                      {role === "APPROVED_RESELLER" && (
                        <Link href="/reseller/dashboard" onClick={() => setAccountMenuOpen(false)} className="block px-3 py-1.5 hover:bg-navy-50 font-semibold text-amber-600">
                          💼 Partner Dashboard
                        </Link>
                      )}
                      {isAdmin ? (
                        <Link href="/admin" onClick={() => setAccountMenuOpen(false)} className="block px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 rounded font-bold text-navy-900 border border-amber-400/50 my-1">
                          ⚙️ Admin Console →
                        </Link>
                      ) : (
                        <Link href="/admin" onClick={() => setAccountMenuOpen(false)} className="block px-3 py-1.5 hover:bg-navy-50 text-navy-600 text-[11px]">
                          ⚙️ Admin Portal
                        </Link>
                      )}
                    </div>
                    <div className="pt-1">
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full text-left px-3 py-1.5 font-bold text-danger hover:bg-danger/10 rounded"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-2 space-y-2">
                    <Link
                      href="/login"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block w-full text-center rounded-card bg-navy-900 py-2 font-bold text-amber-400 hover:bg-navy-600 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/admin"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block w-full text-center rounded-card bg-amber-50 border border-amber-300 py-1.5 font-bold text-navy-900 hover:bg-amber-100 transition-colors text-[11px]"
                    >
                      ⚙️ Super Admin Console
                    </Link>
                    <Link
                      href="/reseller/apply"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block w-full text-center rounded-card border border-line py-1.5 font-semibold text-navy-600 hover:bg-navy-50 transition-colors text-[11px]"
                    >
                      Become a Partner Reseller
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dedicated Admin Console Header Quick Button */}
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 rounded-card bg-amber-500 hover:bg-amber-400 px-3 py-2 text-xs font-bold text-navy-900 shadow-sm transition-all border border-amber-600/30"
            >
              <span>⚙️</span>
              <span>Admin Console</span>
            </Link>
          )}

          {/* Orders Link */}
          {session && (
            <Link href="/orders" className="hidden lg:flex flex-col text-xs text-navy-600 hover:text-ink">
              <span className="text-[10px] text-navy-400 font-mono uppercase">Returns</span>
              <span className="font-bold text-ink">& Orders</span>
            </Link>
          )}

          {/* Shopping Cart Button with Dynamic Badge */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-card bg-navy-900 px-3.5 py-2 text-xs font-bold text-amber-400 hover:bg-navy-600 transition-colors shadow-sm"
          >
            <span className="text-base">🛒</span>
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-navy-900">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 3. Category Navigation Strip */}
      <nav className="border-t border-line bg-navy-50/60 overflow-x-auto scrollbar-none">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-6 text-xs font-semibold py-2 whitespace-nowrap">
          <Link href="/search" className="flex items-center gap-1 text-navy-900 font-bold hover:text-amber-600 transition-colors">
            <span>☰</span> All Categories
          </Link>
          <span className="text-line">|</span>

          {CATEGORIES_STRIP.map((cat) => (
            <Link
              key={cat.slug}
              href={`/search?categorySlug=${cat.slug}`}
              className="text-navy-600 hover:text-ink transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
