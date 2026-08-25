"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const supabase = createClient();

  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  
  // Email State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Phone State
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message || "Invalid email or password. Please try again.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+91" + formattedPhone;
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    setLoading(false);

    if (otpError) {
      setError(otpError.message || "Failed to send OTP.");
    } else {
      setOtpSent(true);
      setSuccessMsg("OTP sent successfully to " + formattedPhone);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+91" + formattedPhone;
    }

    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: "sms",
    });

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message || "Invalid OTP. Please try again.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  async function handleQuickLogin(demoEmail: string, demoPass: string) {
    setLoginMethod("email");
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPass,
    });

    setLoading(false);
    
    if (signInError) {
      setError(signInError.message || "Quick login failed.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <Card className="w-full shadow-lg border-navy-100">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-card bg-navy-900 text-amber-400 font-display font-bold text-2xl">
          C
        </div>
        <CardTitle className="text-2xl font-display">Sign In to Cartigo</CardTitle>
        <CardDescription>
          Enter your details to access the marketplace.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Method Toggle */}
        <div className="flex rounded-card bg-navy-50/50 p-1 mb-6 border border-line">
          <button
            type="button"
            onClick={() => { setLoginMethod("phone"); setError(null); setSuccessMsg(null); }}
            className={`flex-1 rounded py-1.5 text-xs font-bold transition-all ${
              loginMethod === "phone" ? "bg-white shadow-sm text-navy-900" : "text-navy-500 hover:text-navy-700"
            }`}
          >
            Phone OTP
          </button>
          <button
            type="button"
            onClick={() => { setLoginMethod("email"); setError(null); setSuccessMsg(null); }}
            className={`flex-1 rounded py-1.5 text-xs font-bold transition-all ${
              loginMethod === "email" ? "bg-white shadow-sm text-navy-900" : "text-navy-500 hover:text-navy-700"
            }`}
          >
            Email
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-card bg-danger/10 border border-danger/20 p-3 text-xs text-danger font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-card bg-success/10 border border-success/20 p-3 text-xs text-success font-medium">
            {successMsg}
          </div>
        )}

        {/* PHONE OTP FLOW */}
        {loginMethod === "phone" && !otpSent && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600 mb-1">
                Mobile Number
              </label>
              <div className="flex items-center rounded-card border border-line bg-white focus-within:border-navy-400 focus-within:ring-2 focus-within:ring-navy-400/20 overflow-hidden transition">
                <span className="pl-3.5 pr-2 text-sm text-navy-500 font-medium bg-navy-50 py-2 border-r border-line">+91</span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9999999999"
                  className="w-full px-3 py-2 text-sm text-ink outline-none"
                />
              </div>
            </div>
            <Button type="submit" loading={loading} className="w-full mt-2 py-2.5 text-sm bg-navy-900 hover:bg-navy-800 text-white">
              Send OTP
            </Button>
          </form>
        )}

        {loginMethod === "phone" && otpSent && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600 mb-1">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-center tracking-widest text-ink outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-400/20"
              />
            </div>
            <Button type="submit" loading={loading} className="w-full mt-2 py-2.5 text-sm">
              Verify & Login
            </Button>
            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="text-xs text-navy-500 font-medium mt-1 hover:text-navy-900"
            >
              ← Change Mobile Number
            </button>
          </form>
        )}

        {/* EMAIL LOGIN FLOW */}
        {loginMethod === "email" && (
          <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-400/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-400/20"
              />
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2 py-2.5 text-sm">
              Sign In with Email
            </Button>
          </form>
        )}

        {/* Super Admin Quick Credentials - Only in Dev */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 pt-6 border-t border-line">
            <p className="text-xs font-semibold uppercase tracking-widest text-navy-400 mb-3 text-center">
              Super Admin Access (Dev Only)
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("amanshukla@cartigo.admin", "Aman@2008")}
                className="flex items-center justify-between rounded-card border border-amber-300 bg-amber-50/60 p-2.5 text-xs text-left hover:bg-amber-100 transition-colors"
              >
                <div>
                  <p className="font-semibold text-navy-900">Aman Shukla (Super Admin)</p>
                  <p className="text-navy-600 font-mono text-[10px]">amanshukla@cartigo.admin</p>
                </div>
                <span className="rounded bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-navy-900">
                  SUPER_ADMIN
                </span>
              </button>
  
              <button
                type="button"
                onClick={() => handleQuickLogin("sumitgautam@cartigo.admin", "Sumit@2008")}
                className="flex items-center justify-between rounded-card border border-navy-200 bg-navy-50/60 p-2.5 text-xs text-left hover:bg-navy-100 transition-colors"
              >
                <div>
                  <p className="font-semibold text-navy-900">Sumit Gautam (Super Admin)</p>
                  <p className="text-navy-600 font-mono text-[10px]">sumitgautam@cartigo.admin</p>
                </div>
                <span className="rounded bg-navy-900 px-2 py-0.5 text-[10px] font-bold text-white">
                  SUPER_ADMIN
                </span>
              </button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-2 justify-center text-xs text-navy-600">
        <div>
          Don't have an account?{" "}
          <Link href="/signup" className="font-semibold text-navy-900 underline ml-1 hover:text-amber-600">
            Sign Up
          </Link>
        </div>
        <div>
          Want to sell on Cartigo?{" "}
          <Link href="/reseller" className="font-semibold text-navy-900 underline ml-1 hover:text-amber-600">
            Apply as Reseller
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col items-center justify-center p-6">
      <Suspense fallback={<div className="p-8 text-center text-xs text-navy-600 animate-pulse">Loading login form...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
