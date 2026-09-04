"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/supabase/hooks";
import { useEffect, useState, useRef } from "react";
import { getCart } from "@/server/cart";
import { getSearchSuggestions } from "@/server/search";
import { StatusBadge } from "@/components/ui/status-badge";
import { CartigoLogoIcon } from "@/components/ui/cartigo-logo";

import { 
  Tv, 
  Smartphone, 
  Laptop, 
  Coffee, 
  Shirt, 
  Sparkles, 
  Dumbbell, 
  Gamepad2, 
  Tag 
} from "lucide-react";

const CATEGORIES_STRIP = [
  { name: "Electronics", slug: "electronics", icon: Tv },
  { name: "Mobiles & Tablets", slug: "mobiles-tablets", icon: Smartphone },
  { name: "Computers & Laptops", slug: "computers-laptops", icon: Laptop },
  { name: "Home & Kitchen", slug: "home-kitchen", icon: Coffee },
  { name: "Fashion & Apparel", slug: "fashion-apparel", icon: Shirt },
  { name: "Beauty & Care", slug: "beauty-care", icon: Sparkles },
  { name: "Sports & Fitness", slug: "sports-fitness", icon: Dumbbell },
  { name: "Gaming & Consoles", slug: "gaming", icon: Gamepad2 },
  { name: "Today's Deals", slug: "deals", icon: Tag },
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
    <header className="sticky top-0 z-50 shadow-sm flex flex-col bg-white">
      {/* 1. Top Utility Announcement Bar (Hidden on Mobile) */}
      <div className="hidden sm:flex bg-navy-900 text-white text-[11px] py-1.5 px-4 sm:px-8 items-center justify-between font-medium">
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

      {/* 2. Main Marketplace Header Bar (Dark on mobile, Light on desktop) */}
      <div className="bg-[#050B14] sm:bg-paper/98 sm:border-b sm:border-line w-full">
        <div className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8 py-2.5">
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-2 shrink-0">
            <CartigoLogoIcon className="h-8 w-8 sm:h-10 sm:w-10 text-amber-500 sm:text-navy-900 transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white sm:text-ink leading-none">
                CARTIGO
              </span>
              <span className="text-[8px] sm:text-[10px] font-mono font-medium text-amber-500 sm:text-navy-600 tracking-widest uppercase">
                Verified Marketplace
              </span>
            </div>
          </Link>

          {/* Prominent Center Search Engine Bar (Desktop Only) */}
          <div ref={searchRef} className="relative flex-1 max-w-2xl mx-2 hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="flex items-center rounded-card border border-navy-600/30 bg-white shadow-sm focus-within:border-navy-900 focus-within:ring-2 focus-within:ring-navy-400/30 overflow-hidden">
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
              </select>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                placeholder="Search products, brands and categories..."
                className="w-full px-4 py-2 text-sm text-ink outline-none placeholder:text-navy-400"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-navy-900 font-bold px-5 py-2.5 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-card border border-line bg-white shadow-lg z-50 overflow-hidden divide-y divide-line">
                {suggestions.map((item) => (
                  <Link key={item.slug} href={`/products/${item.slug}`} onClick={() => setShowSuggestions(false)} className="flex items-center justify-between p-3 text-xs hover:bg-navy-50 transition-colors">
                    <span className="font-semibold text-ink">{item.title}</span>
                    <span className="font-mono text-[10px] bg-navy-50 text-navy-600 px-2 py-0.5 rounded">{item.categoryName}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Account & Shopping Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Mobile Account Button (White Pill) */}
            <button
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="sm:hidden flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-navy-900 shadow-sm"
            >
              <svg className="w-4 h-4 text-blue-600 fill-current" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              Account
            </button>

            {/* Desktop Account Dropdown Menu */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center gap-1.5 rounded-card border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-navy-50 transition-colors"
              >
                <div className="text-left">
                  <p className="text-[10px] uppercase text-navy-400 font-mono">
                    {session ? "Welcome back" : "Hello, Sign In"}
                  </p>
                  <p className="font-bold text-ink text-xs line-clamp-1">
                    {session?.user?.name || session?.user?.email || "Account & Orders ▾"}
                  </p>
                </div>
              </button>
            </div>

            {/* Mobile / Desktop Menu Popover */}
            {accountMenuOpen && (
              <div className="absolute top-16 right-4 sm:top-auto sm:right-0 sm:mt-2 w-56 rounded-card border border-line bg-white p-2 shadow-xl z-50 text-xs divide-y divide-line">
                {session ? (
                  <>
                    <div className="p-2">
                      <p className="font-bold text-ink">{session.user?.name}</p>
                      <p className="text-navy-400 font-mono text-[11px]">{session.user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/orders" onClick={() => setAccountMenuOpen(false)} className="block px-3 py-1.5 hover:bg-navy-50 font-medium text-ink">📦 My Orders</Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setAccountMenuOpen(false)} className="block px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 rounded font-bold text-navy-900 border border-amber-400/50 my-1">⚙️ Admin Console →</Link>
                      )}
                    </div>
                    <div className="pt-1">
                      <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full text-left px-3 py-1.5 font-bold text-danger hover:bg-danger/10 rounded">Sign Out</button>
                    </div>
                  </>
                ) : (
                  <div className="p-2 space-y-2">
                    <Link href="/login" onClick={() => setAccountMenuOpen(false)} className="block w-full text-center rounded-card bg-navy-900 py-2 font-bold text-amber-400 hover:bg-navy-600 transition-colors">Sign In</Link>
                  </div>
                )}
              </div>
            )}

            {/* Shopping Cart Button */}
            <Link
              href="/cart"
              className="relative flex items-center justify-center sm:gap-2 sm:rounded-card sm:bg-navy-900 sm:px-3.5 sm:py-2 text-xs font-bold text-white sm:text-amber-400 sm:hover:bg-navy-600 transition-colors"
            >
              <svg className="w-6 h-6 sm:w-5 sm:h-5 stroke-2 sm:stroke-none sm:text-base fill-transparent sm:fill-current" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden sm:inline">Cart</span>
              
              {/* Badge */}
              <span className={`absolute -top-1 -right-1 sm:static flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-amber-500 text-[9px] sm:text-[11px] font-bold text-navy-900 ${cartCount === 0 ? 'hidden' : ''}`}>
                {cartCount}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Category Navigation Strip (Scrollable on mobile) */}
      <nav className="border-b sm:border-t sm:border-b-0 border-line bg-navy-50 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-6 text-xs sm:text-xs font-semibold py-2.5 sm:py-2 whitespace-nowrap">
          <Link href="/search" className="flex items-center gap-1.5 text-navy-900 font-bold hover:text-amber-600 transition-colors">
            <span className="text-lg leading-none">≡</span> 
            <span>All Categories</span>
          </Link>
          <span className="text-line hidden sm:inline">|</span>
          <span className="text-line sm:hidden h-4 border-l border-navy-300"></span>

          {CATEGORIES_STRIP.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/search?categorySlug=${cat.slug}`}
                className="flex items-center gap-1.5 text-navy-800 sm:text-navy-600 hover:text-ink transition-colors"
              >
                <Icon className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
