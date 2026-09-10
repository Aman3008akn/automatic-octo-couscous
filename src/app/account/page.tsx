"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/supabase/hooks";
import {
  Package,
  Heart,
  Gift,
  Headphones,
  Mail,
  CreditCard,
  MapPin,
  Languages,
  Bell,
  Lock,
  Edit3,
  MessageSquare,
  Store,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Zap,
  Sparkles,
  CheckCircle2,
  X,
  Copy,
  Check,
  PhoneCall,
  ExternalLink,
  Info,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user;

  // Active drawer/modal state
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activePolicyTab, setActivePolicyTab] = useState<"terms" | "returns" | "authenticity" | "privacy" | "licenses">("terms");
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi">("en");
  const [emailUpdatedMsg, setEmailUpdatedMsg] = useState(false);
  const [emailInput, setEmailInput] = useState(user?.email || "");

  // Notification toggles
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    dropAlerts: true,
    promoOffers: false,
    whatsappUpdates: true,
  });

  const handleCopyCoupon = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCoupon(code);
      setTimeout(() => setCopiedCoupon(null), 2000);
    }
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out of Cartygo?")) {
      await signOut({ callbackUrl: "/" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F3F6] pb-24 md:pb-12 text-[#212121]">
      <div className="mx-auto max-w-2xl bg-white shadow-sm md:my-6 md:rounded-2xl md:border md:border-slate-200 overflow-hidden">
        
        {/* 1. Profile Header Card (Matching Flipkart My-Account) */}
        <div className="bg-gradient-to-r from-[#F0F5FF] via-[#EBF3FF] to-[#FFF9F0] p-4 sm:p-5 border-b border-slate-200/80">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-11 h-11 rounded-full bg-navy-900 text-amber-400 font-display font-black text-lg flex items-center justify-center shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "C"}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-navy-950 font-display leading-tight">
                    {user?.name || "Cartygo Shopper"}
                  </h1>
                  <p className="text-xs text-navy-600 font-medium">
                    {user?.email || "Guest Customer"}
                  </p>
                </div>
              </div>

              <p className="text-xs text-navy-700 pt-1 font-medium leading-relaxed max-w-sm">
                Enjoy 14-Day Acceptance, Early Access to Drops & Verified Escrow Protection.
              </p>

              <div className="pt-1.5 flex items-center gap-2">
                <button
                  onClick={() => setActiveModal("black")}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-navy-950 text-white text-xs font-black tracking-wider uppercase shadow-sm hover:bg-navy-900 active:scale-95 transition-all"
                >
                  <span>Explore</span>
                  <span className="text-amber-400 font-black">BLACK</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </button>

                {user?.role === "APPROVED_RESELLER" && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ✓ Verified Reseller
                  </span>
                )}
                {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    👑 Executive Admin
                  </span>
                )}
              </div>
            </div>

            {/* Cartygo Coins Badge */}
            <div className="flex flex-col items-end shrink-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/80 border border-amber-300/80 text-amber-900 font-bold text-xs shadow-xs">
                <span className="text-sm">🪙</span>
                <span className="font-mono font-bold">50</span>
              </div>
              <span className="text-[10px] text-navy-500 font-medium mt-0.5">Cartygo Coins</span>
            </div>
          </div>
        </div>

        {/* Guest prompt if not logged in */}
        {!user && status !== "loading" && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-between">
            <div className="text-xs text-amber-900">
              <span className="font-bold">Sign in to your Cartygo account</span>
              <p className="text-[11px] text-amber-800">Track real-time orders, manage returns & save addresses.</p>
            </div>
            <Link
              href="/login"
              className="px-4 py-1.5 bg-navy-900 text-amber-400 rounded-lg text-xs font-bold shrink-0 hover:bg-navy-800 shadow-sm"
            >
              Sign In
            </Link>
          </div>
        )}

        {/* 2. Top 4 Action Grid Buttons (Orders, Wishlist, Coupons, Help Center) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-white border-b border-slate-200">
          <Link
            href="/orders"
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-navy-300 hover:bg-slate-50/60 active:scale-98 transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0066ff] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Orders</span>
          </Link>

          <button
            onClick={() => router.push("/orders?tab=wishlist")}
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-navy-300 hover:bg-slate-50/60 active:scale-98 transition-all text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Wishlist</span>
          </button>

          <button
            onClick={() => setActiveModal("coupons")}
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-navy-300 hover:bg-slate-50/60 active:scale-98 transition-all text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Coupons</span>
          </button>

          <button
            onClick={() => setActiveModal("help")}
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-navy-300 hover:bg-slate-50/60 active:scale-98 transition-all text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Help Center</span>
          </button>
        </div>

        {/* 3. Add/Verify Email Banner Strip (Matching Screenshot 2) */}
        <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center relative shrink-0">
              <Mail className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">Add / Verify your Email</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              </div>
              <p className="text-[11px] text-slate-500">Get latest updates of your orders & Cartygo drops</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal("updateContact")}
            className="px-3.5 py-1.5 bg-[#0066ff] hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm transition-all shrink-0"
          >
            Update
          </button>
        </div>

        {/* 4. Finance Options & Buyer Escrow (Matching Screenshot 2) */}
        <div className="p-4 bg-white border-b border-slate-200 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Finance Options & Protection</h2>

          <div className="space-y-3 divide-y divide-slate-100">
            {/* Buyer Escrow Protection */}
            <div className="pt-2 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 p-2 rounded-lg" onClick={() => setActiveModal("terms")}>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#0066ff] shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-900">Cartygo Buyer Escrow Protection</p>
                  <p className="text-[11px] text-slate-500">100% money-back security held until delivery confirmation</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Cartygo Pay Later / Personal Loan */}
            <div className="pt-3 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 p-2 rounded-lg" onClick={() => setActiveModal("cards")}>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-900">Cartygo Pay Later & Instant Credit</p>
                  <p className="text-[11px] text-slate-500">₹25,000 credit line | 0% interest for 30 days</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Pre-Approved Credit Card */}
            <div className="pt-3 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 p-2 rounded-lg" onClick={() => setActiveModal("cards")}>
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-900">Pre-Approved Cartygo Credit Card</p>
                  <p className="text-[11px] text-slate-500">5% unlimited cashback on verified drops | Lifetime Free</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* 5. Account Settings Menu List (Matching Screenshot 1) */}
        <div className="bg-white border-b border-slate-200 divide-y divide-slate-100">
          <button
            onClick={() => setActiveModal("cards")}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 text-left transition-colors"
          >
            <div className="flex items-center gap-3.5 text-slate-700">
              <CreditCard className="w-5 h-5 text-[#0066ff]" />
              <span className="text-xs font-medium text-slate-900">Saved Credit / Debit & Gift Cards</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setActiveModal("addresses")}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 text-left transition-colors"
          >
            <div className="flex items-center gap-3.5 text-slate-700">
              <MapPin className="w-5 h-5 text-[#0066ff]" />
              <span className="text-xs font-medium text-slate-900">Saved Addresses</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setActiveModal("language")}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 text-left transition-colors"
          >
            <div className="flex items-center gap-3.5 text-slate-700">
              <Languages className="w-5 h-5 text-[#0066ff]" />
              <span className="text-xs font-medium text-slate-900">
                Select Language ({selectedLanguage === "en" ? "English" : "हिन्दी"})
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setActiveModal("notifications")}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 text-left transition-colors"
          >
            <div className="flex items-center gap-3.5 text-slate-700">
              <Bell className="w-5 h-5 text-[#0066ff]" />
              <span className="text-xs font-medium text-slate-900">Notification Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setActiveModal("privacy")}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 text-left transition-colors"
          >
            <div className="flex items-center gap-3.5 text-slate-700">
              <Lock className="w-5 h-5 text-[#0066ff]" />
              <span className="text-xs font-medium text-slate-900">Privacy Center & Data Controls</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* 6. My Activity Section (Matching Screenshot 1) */}
        <div className="bg-white border-b border-slate-200">
          <div className="px-4 pt-4 pb-1">
            <h3 className="text-sm font-bold text-slate-900">My Activity</h3>
          </div>
          <div className="divide-y divide-slate-100">
            <button
              onClick={() => setActiveModal("reviews")}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 text-left transition-colors"
            >
              <div className="flex items-center gap-3.5 text-slate-700">
                <Edit3 className="w-5 h-5 text-[#0066ff]" />
                <span className="text-xs font-medium text-slate-900">Reviews</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveModal("qa")}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 text-left transition-colors"
            >
              <div className="flex items-center gap-3.5 text-slate-700">
                <MessageSquare className="w-5 h-5 text-[#0066ff]" />
                <span className="text-xs font-medium text-slate-900">Questions & Answers</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* 7. Earn with Cartygo Section (Matching Screenshot 1) */}
        <div className="bg-white border-b border-slate-200">
          <div className="px-4 pt-4 pb-1">
            <h3 className="text-sm font-bold text-slate-900">Earn with Cartygo</h3>
          </div>
          <Link
            href={
              user?.role === "APPROVED_RESELLER"
                ? "/reseller/dashboard"
                : user?.role === "RESELLER_APPLICANT"
                ? "/reseller/status"
                : "/reseller"
            }
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 text-left transition-colors"
          >
            <div className="flex items-center gap-3.5 text-slate-700">
              <Store className="w-5 h-5 text-[#0066ff]" />
              <div>
                <span className="text-xs font-medium text-slate-900">
                  {user?.role === "APPROVED_RESELLER"
                    ? "Go to Seller Dashboard"
                    : "Sell on Cartygo (Reseller Program)"}
                </span>
                <p className="text-[10px] text-emerald-700 font-semibold">Join verified sellers & distributors</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
            <Link
              href="/admin"
              className="w-full px-4 py-3.5 flex items-center justify-between bg-amber-50/40 hover:bg-amber-100/50 text-left transition-colors border-t border-amber-200/50"
            >
              <div className="flex items-center gap-3.5">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <div>
                  <span className="text-xs font-bold text-navy-950">Cartygo Control Tower (Executive Admin)</span>
                  <p className="text-[10px] text-amber-800">Review onboarding apps & audit logs</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-600" />
            </Link>
          )}
        </div>

        {/* 8. Feedback & Information (Cartygo Terms, Policies & Licenses - Screenshot 1) */}
        <div className="bg-white border-b border-slate-200">
          <div className="px-4 pt-4 pb-1">
            <h3 className="text-sm font-bold text-slate-900">Feedback & Information</h3>
          </div>
          <div className="divide-y divide-slate-100">
            <button
              onClick={() => {
                setActivePolicyTab("terms");
                setActiveModal("terms");
              }}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 text-left transition-colors"
            >
              <div className="flex items-center gap-3.5 text-slate-700">
                <FileText className="w-5 h-5 text-[#0066ff]" />
                <div>
                  <span className="text-xs font-medium text-slate-900">Terms, Policies and Licenses</span>
                  <p className="text-[10px] text-slate-500">Cartygo User Agreement, 14-Day Return Policy & Guarantees</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveModal("faqs")}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 text-left transition-colors"
            >
              <div className="flex items-center gap-3.5 text-slate-700">
                <HelpCircle className="w-5 h-5 text-[#0066ff]" />
                <span className="text-xs font-medium text-slate-900">Browse FAQs</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* 9. Log Out Button (Matching Screenshot 1) */}
        {user ? (
          <div className="p-4 bg-white">
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-white border border-slate-300 hover:border-red-400 hover:bg-red-50/30 text-[#0066ff] hover:text-red-600 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <div className="p-4 bg-white">
            <Link
              href="/login"
              className="w-full py-3 bg-[#0066ff] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In to Cartygo</span>
            </Link>
          </div>
        )}

        {/* Brand Copyright Footer */}
        <div className="p-4 text-center text-[10px] text-slate-400 bg-[#F1F3F6] border-t border-slate-200">
          <p>Cartygo Marketplace Inc. • Version 2.4.0 (PWA Mobile)</p>
          <p className="mt-0.5 font-mono">Verified Reseller Commerce Standard</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CARTYGO TERMS, POLICIES & LICENSES (Full Legal Center)             */}
      {/* ========================================================================= */}
      {activeModal === "terms" && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-navy-900 text-amber-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-navy-950 font-display">
                    Cartygo Terms, Policies & Licenses
                  </h2>
                  <p className="text-[11px] text-slate-500">Official legal documents & platform protection standards</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Policy Navigation Tabs */}
            <div className="flex items-center border-b border-slate-200 overflow-x-auto no-scrollbar bg-white px-2">
              <button
                onClick={() => setActivePolicyTab("terms")}
                className={`px-3 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                  activePolicyTab === "terms"
                    ? "border-[#0066ff] text-[#0066ff]"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                1. Terms of Use
              </button>
              <button
                onClick={() => setActivePolicyTab("returns")}
                className={`px-3 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                  activePolicyTab === "returns"
                    ? "border-[#0066ff] text-[#0066ff]"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                2. 14-Day Returns
              </button>
              <button
                onClick={() => setActivePolicyTab("authenticity")}
                className={`px-3 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                  activePolicyTab === "authenticity"
                    ? "border-[#0066ff] text-[#0066ff]"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                3. Authenticity Guarantee
              </button>
              <button
                onClick={() => setActivePolicyTab("privacy")}
                className={`px-3 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                  activePolicyTab === "privacy"
                    ? "border-[#0066ff] text-[#0066ff]"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                4. Privacy Policy
              </button>
              <button
                onClick={() => setActivePolicyTab("licenses")}
                className={`px-3 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                  activePolicyTab === "licenses"
                    ? "border-[#0066ff] text-[#0066ff]"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                5. Licenses & Compliance
              </button>
            </div>

            {/* Scrollable Legal Text Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed font-sans">
              {activePolicyTab === "terms" && (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
                    <p className="font-bold text-blue-900">Cartygo Marketplace User Agreement</p>
                    <p className="text-[11px] text-blue-800">Last updated: September 2026 • Governs all transactions on Cartygo website & mobile applications.</p>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">1. Introduction & Acceptance</h3>
                  <p>
                    Welcome to Cartygo Marketplace ("Cartygo", "we", "our"). By accessing, browsing, registering, or placing an order through our web platform, Progressive Web Application (PWA), or mobile application, you unconditionally agree to be bound by these Terms of Service.
                  </p>

                  <h3 className="font-bold text-slate-900 text-sm">2. Vetted Reseller Model</h3>
                  <p>
                    Unlike unverified open marketplaces, Cartygo exclusively features vetted distributors and approved merchants who have undergone strict GST, identity, and inventory provenance verification. Cartygo operates as an authorized platform facilitating genuine consumer purchases with escrow-protected settlements.
                  </p>

                  <h3 className="font-bold text-slate-900 text-sm">3. Order Fulfillment & Escrow Protection</h3>
                  <p>
                    When a buyer purchases an item on Cartygo, the funds are safely held in the Cartygo Escrow vault. Payment is released to the seller only after confirmed delivery and following our mandatory 14-day inspection window.
                  </p>

                  <h3 className="font-bold text-slate-900 text-sm">4. Prohibited Activities</h3>
                  <p>
                    Users and merchants are prohibited from circumventing platform payment mechanisms, posting counterfeit listings, publishing fraudulent reviews, or scraping pricing and catalog data without express written permission.
                  </p>
                </div>
              )}

              {activePolicyTab === "returns" && (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                    <p className="font-bold text-amber-900">Cartygo Standard 14-Day Return & Refund Guarantee</p>
                    <p className="text-[11px] text-amber-800">Zero-hassle returns on all verified merchant products.</p>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">1. 14-Day Acceptance Window</h3>
                  <p>
                    Every buyer is entitled to a full 14 calendar days from the date of physical delivery to inspect their purchased items. If the product is defective, misrepresented, damaged in transit, or does not match specifications, a 1-tap return can be initiated through the Cartygo Account portal.
                  </p>

                  <h3 className="font-bold text-slate-900 text-sm">2. Free Doorstep Reverse Pickup</h3>
                  <p>
                    For all approved return requests, Cartygo Express Logistics or our authorized courier partners will perform free doorstep inspection and reverse pickup. The buyer does not incur any return shipping charges.
                  </p>

                  <h3 className="font-bold text-slate-900 text-sm">3. Instant Escrow Refund</h3>
                  <p>
                    Upon doorstep pickup and QR verification by the delivery executive, the refund is instantly triggered back to the original payment source (UPI, Card, or Cartygo Wallet) within 2 to 4 business hours.
                  </p>
                </div>
              )}

              {activePolicyTab === "authenticity" && (
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                    <p className="font-bold text-emerald-900">100% Verified Authenticity Guarantee</p>
                    <p className="text-[11px] text-emerald-800">Zero tolerance for counterfeit goods • 2X Money-Back Promise.</p>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">1. Mandatory Merchant Vetting</h3>
                  <p>
                    Every reseller on Cartygo is required to provide authorized distribution certificates, tax compliance filings, and manufacturer batch verification before listing products in electronics, mobiles, fashion, or kitchen appliances.
                  </p>

                  <h3 className="font-bold text-slate-900 text-sm">2. Random Batch Audits</h3>
                  <p>
                    Cartygo compliance officers conduct unannounced physical audits at partner fulfillment centers and review customer sentiment telemetry to flag any inventory irregularities.
                  </p>

                  <h3 className="font-bold text-slate-900 text-sm">3. 2X Refund for Inauthentic Items</h3>
                  <p>
                    In the rare event that an item is verified to be non-genuine by brand service centers, Cartygo provides a double refund (200% of purchase value) directly to the affected customer.
                  </p>
                </div>
              )}

              {activePolicyTab === "privacy" && (
                <div className="space-y-3">
                  <div className="bg-slate-100 border border-slate-200 p-3 rounded-xl">
                    <p className="font-bold text-slate-900">Cartygo Privacy & Data Protection Policy</p>
                    <p className="text-[11px] text-slate-600">Compliant with Digital Personal Data Protection (DPDP) Act 2023.</p>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">1. Data Minimization</h3>
                  <p>
                    We collect only information essential to process orders, facilitate delivery, prevent fraudulent transactions, and provide customer support. We never sell your personal contact numbers or browsing records to third-party telemarketers.
                  </p>

                  <h3 className="font-bold text-slate-900 text-sm">2. Tokenized Payment Security</h3>
                  <p>
                    All payment processing is executed via RBI-compliant PCI-DSS Level 1 payment gateways with dynamic card tokenization. Raw CVV numbers and bank passwords are never stored on Cartygo servers.
                  </p>

                  <h3 className="font-bold text-slate-900 text-sm">3. Right to Erasure</h3>
                  <p>
                    Users have the full right to download their transaction history or request permanent account and telemetry erasure via the Privacy Center in their Account portal.
                  </p>
                </div>
              )}

              {activePolicyTab === "licenses" && (
                <div className="space-y-3">
                  <div className="bg-slate-100 border border-slate-200 p-3 rounded-xl">
                    <p className="font-bold text-slate-900">Licenses, Business Registrations & Open Source Disclosures</p>
                    <p className="text-[11px] text-slate-600">Cartygo Marketplace Inc. Legal Compliance Portfolio.</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                    <p><strong>Entity:</strong> Cartygo Marketplace Private Limited</p>
                    <p><strong>GST Registration:</strong> 07AAACC4129Q1ZU (Active)</p>
                    <p><strong>Toll-Free Helpline:</strong> +91 8826817677 / +91 8840108332</p>
                    <p><strong>Official Compliance Desk:</strong> admindesk@cartygo.com</p>
                    <p><strong>Registered Headquarters:</strong> Cartygo Control Tower, Sector 62, Noida, NCR, India</p>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">Software & Architecture Licenses</h3>
                  <p>
                    Cartygo web and mobile clients are built using React, Next.js, TailwindCSS, and Lucide Icons under the MIT License. All intellectual property, trademarks, and brand marks belong exclusively to Cartygo Marketplace Inc.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">Cartygo Legal & Compliance Center</span>
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-navy-900 text-amber-400 font-bold text-xs rounded-xl shadow-sm hover:bg-navy-800"
              >
                I Understand & Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BROWSE FAQS                                                        */}
      {/* ========================================================================= */}
      {activeModal === "faqs" && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#0066ff]" />
                <h3 className="font-bold text-slate-900 text-sm">Cartygo Frequently Asked Questions</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-700" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900">Q: How does Cartygo Buyer Escrow protection work?</p>
                <p className="text-slate-600 mt-1">
                  Your money is securely locked in Cartygo Escrow. The seller is only paid after you receive the product and pass the 14-day inspection window.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900">Q: What is the delivery timeframe?</p>
                <p className="text-slate-600 mt-1">
                  Items fulfilled via Cartygo Express Logistics are delivered in 2 business days. Direct seller fulfillment arrives within 3 to 5 business days with real-time SMS tracking.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900">Q: How do I become a verified seller?</p>
                <p className="text-slate-600 mt-1">
                  Click on "Sell on Cartygo" in your account to submit business registration details. Compliance officers review applications within 24-48 hours.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900">Q: What payment methods are accepted?</p>
                <p className="text-slate-600 mt-1">
                  We accept UPI (Google Pay, PhonePe, Paytm), Visa, Mastercard, RuPay cards, Net Banking, and Cash on Delivery (COD).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CARTYGO BLACK (VIP REWARDS)                                        */}
      {/* ========================================================================= */}
      {activeModal === "black" && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#0D121F] text-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black">
                <Sparkles className="w-3.5 h-3.5" />
                <span>CARTYGO BLACK MEMBERSHIP</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-300" />
              </button>
            </div>

            <h3 className="text-xl font-bold font-display text-white">
              Upgrade to the Ultimate Shopping Tier
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Zero delivery fees on all verified drops</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>2-Hour Early Access to limited product launches</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>VIP 24/7 dedicated helpline & priority agent support</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Earn 2X Cartygo Coins on every transaction</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert("Congratulations! Cartygo Black benefits have been activated for your account.");
                setActiveModal(null);
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-navy-950 font-black text-xs rounded-xl shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all mt-2"
            >
              CLAIM BLACK PRIVILEGES FREE
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ACTIVE COUPONS                                                     */}
      {/* ========================================================================= */}
      {activeModal === "coupons" && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-base">Your Active Cartygo Coupons</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { code: "CARTYGO10", desc: "Flat 10% OFF on first verified order", min: "Min spend ₹999" },
                { code: "CARTYGO15", desc: "Special 15% OFF on Electronics & Gadgets", min: "Min spend ₹2,499" },
                { code: "CARTYGO20", desc: "Festival VIP 20% OFF Drop Voucher", min: "Min spend ₹4,999" },
              ].map((c) => (
                <div key={c.code} className="p-3 rounded-xl border border-dashed border-amber-400 bg-amber-50/50 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-mono font-black text-amber-700 text-sm tracking-wider">{c.code}</span>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">{c.desc}</p>
                    <p className="text-[10px] text-slate-500">{c.min}</p>
                  </div>
                  <button
                    onClick={() => handleCopyCoupon(c.code)}
                    className="px-3 py-1.5 bg-navy-900 text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                  >
                    {copiedCoupon === c.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: HELP CENTER & HELPLINE                                             */}
      {/* ========================================================================= */}
      {activeModal === "help" && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Headphones className="w-5 h-5 text-[#0066ff]" />
                <h3 className="font-bold text-slate-900 text-base">Cartygo 24/7 Help & Support</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-blue-950">Executive Helpline 1</p>
                  <p className="text-blue-800 font-mono text-sm font-bold mt-0.5">+91 8826817677</p>
                </div>
                <a
                  href="tel:+918826817677"
                  className="px-3.5 py-1.5 bg-[#0066ff] text-white font-bold rounded-lg flex items-center gap-1"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-blue-950">Executive Helpline 2</p>
                  <p className="text-blue-800 font-mono text-sm font-bold mt-0.5">+91 8840108332</p>
                </div>
                <a
                  href="tel:+918840108332"
                  className="px-3.5 py-1.5 bg-[#0066ff] text-white font-bold rounded-lg flex items-center gap-1"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Email Customer Desk</p>
                  <p className="text-slate-600 font-mono text-xs">admindesk@cartygo.com</p>
                </div>
                <a
                  href="mailto:admindesk@cartygo.com"
                  className="px-3.5 py-1.5 bg-navy-900 text-amber-400 font-bold rounded-lg flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SAVED CARDS                                                        */}
      {/* ========================================================================= */}
      {activeModal === "cards" && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#0066ff]" />
                <h3 className="font-bold text-slate-900 text-base">Saved Cards & Payment Methods</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 rounded bg-[#1A1F71] text-white text-[9px] font-black flex items-center justify-center">
                    VISA
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">•••• •••• •••• 4242</p>
                    <p className="text-[10px] text-slate-500">Tokenized Card • Exp 08/29</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Default</span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 rounded bg-[#5f259f] text-white text-[9px] font-black flex items-center justify-center">
                    UPI
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">cartygo.user@okhdfcbank</p>
                    <p className="text-[10px] text-slate-500">Instant UPI 1-Tap</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">Verified</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert("New card tokenization flow will open on checkout.");
                setActiveModal(null);
              }}
              className="w-full py-2.5 bg-navy-900 text-amber-400 font-bold text-xs rounded-xl shadow-sm hover:bg-navy-800"
            >
              + Add New Payment Method
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SAVED ADDRESSES                                                    */}
      {/* ========================================================================= */}
      {activeModal === "addresses" && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0066ff]" />
                <h3 className="font-bold text-slate-900 text-base">Saved Delivery Addresses</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border-2 border-[#0066ff] bg-blue-50/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{user?.name || "Pinshu Singh"} (Home)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0066ff] text-white">DEFAULT</span>
                </div>
                <p className="text-xs text-slate-700">Flat 402, Royal Residency, Sector 62</p>
                <p className="text-xs text-slate-600">Noida, Uttar Pradesh - 201309</p>
                <p className="text-[11px] text-slate-500 font-mono pt-1">Phone: +91 8826817677</p>
              </div>
            </div>

            <button
              onClick={() => {
                router.push("/checkout");
              }}
              className="w-full py-2.5 bg-navy-900 text-amber-400 font-bold text-xs rounded-xl shadow-sm hover:bg-navy-800"
            >
              + Add New Delivery Address
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SELECT LANGUAGE                                                    */}
      {/* ========================================================================= */}
      {activeModal === "language" && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-[#0066ff]" />
                <h3 className="font-bold text-slate-900 text-base">Choose Language</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedLanguage("en");
                  setActiveModal(null);
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                  selectedLanguage === "en" ? "border-[#0066ff] bg-blue-50 text-[#0066ff]" : "border-slate-200 text-slate-700"
                }`}
              >
                <span>English (India)</span>
                {selectedLanguage === "en" && <Check className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  setSelectedLanguage("hi");
                  setActiveModal(null);
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                  selectedLanguage === "hi" ? "border-[#0066ff] bg-blue-50 text-[#0066ff]" : "border-slate-200 text-slate-700"
                }`}
              >
                <span>हिन्दी (Hindi)</span>
                {selectedLanguage === "hi" && <Check className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NOTIFICATION SETTINGS                                              */}
      {/* ========================================================================= */}
      {activeModal === "notifications" && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#0066ff]" />
                <h3 className="font-bold text-slate-900 text-base">Notification Settings</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="space-y-3 divide-y divide-slate-100 text-xs">
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Order Updates & Tracking</p>
                  <p className="text-slate-500">Real-time status changes and delivery ETA</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.orderUpdates}
                  onChange={(e) => setNotifications({ ...notifications, orderUpdates: e.target.checked })}
                  className="w-4 h-4 accent-[#0066ff]"
                />
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Cartygo Drop Announcements</p>
                  <p className="text-slate-500">Early alerts when exclusive drops go live</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.dropAlerts}
                  onChange={(e) => setNotifications({ ...notifications, dropAlerts: e.target.checked })}
                  className="w-4 h-4 accent-[#0066ff]"
                />
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">WhatsApp Dispatch Tracking</p>
                  <p className="text-slate-500">Receive tracking link & OTP via WhatsApp</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.whatsappUpdates}
                  onChange={(e) => setNotifications({ ...notifications, whatsappUpdates: e.target.checked })}
                  className="w-4 h-4 accent-[#0066ff]"
                />
              </div>
            </div>

            <button
              onClick={() => {
                alert("Notification preferences saved.");
                setActiveModal(null);
              }}
              className="w-full py-2.5 bg-[#0066ff] text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRIVACY CENTER                                                     */}
      {/* ========================================================================= */}
      {activeModal === "privacy" && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#0066ff]" />
                <h3 className="font-bold text-slate-900 text-base">Privacy Center & Data Rights</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900">Download Account Data</p>
                <p className="text-slate-500 mt-0.5">Export a full copy of your orders, addresses, and transaction receipts.</p>
                <button
                  onClick={() => alert("Your data export will be emailed to your registered address within 24 hours.")}
                  className="mt-2 text-xs font-bold text-[#0066ff] hover:underline"
                >
                  Request Data Archive →
                </button>
              </div>

              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <p className="font-bold text-red-900">Account Erasure (Right to be Forgotten)</p>
                <p className="text-red-700 mt-0.5">Permanently delete your profile, addresses, and saved cards in accordance with DPDP rules.</p>
                <button
                  onClick={() => alert("Please contact admindesk@cartygo.com with your seller/buyer ID to process permanent erasure.")}
                  className="mt-2 text-xs font-bold text-red-600 hover:underline"
                >
                  Request Account Deletion →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REVIEWS & QA                                                       */}
      {/* ========================================================================= */}
      {(activeModal === "reviews" || activeModal === "qa") && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {activeModal === "reviews" ? "My Product Reviews" : "Questions & Answers"}
              </h3>
              <button onClick={() => setActiveModal(null)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="py-8 text-center text-xs text-slate-500">
              <p>No active {activeModal === "reviews" ? "reviews" : "queries"} found for this account.</p>
              <p className="text-[11px] text-slate-400 mt-1">Once you complete a purchase, you can rate verified resellers here.</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UPDATE EMAIL / CONTACT                                             */}
      {/* ========================================================================= */}
      {activeModal === "updateContact" && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#0066ff]" />
                <h3 className="font-bold text-slate-900 text-base">Verify & Update Contact</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-[#0066ff]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                <input
                  type="tel"
                  defaultValue="+91 8826817677"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-[#0066ff]"
                />
              </div>

              {emailUpdatedMsg && (
                <p className="text-xs text-emerald-600 font-bold">✓ Verification link sent to your email!</p>
              )}
            </div>

            <button
              onClick={() => {
                setEmailUpdatedMsg(true);
                setTimeout(() => {
                  setActiveModal(null);
                  setEmailUpdatedMsg(false);
                }, 1500);
              }}
              className="w-full py-2.5 bg-[#0066ff] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-blue-700"
            >
              Send Verification OTP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
