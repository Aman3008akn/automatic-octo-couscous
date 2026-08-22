"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  async function handleQuickLogin(demoEmail: string, demoPass: string) {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email: demoEmail,
      password: demoPass,
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError("Quick login failed. Ensure database seed has been executed (`npm run db:seed`).");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <Card className="w-full shadow-lg border-navy-100">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-card bg-navy-900 text-amber-400 font-display font-bold text-2xl">
          C
        </div>
        <CardTitle className="text-2xl font-display">Sign In to Cartigo</CardTitle>
        <CardDescription>
          Enter your credentials to access the marketplace, seller dashboard, or admin console.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 rounded-card bg-danger/10 border border-danger/20 p-3 text-xs text-danger font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
            Sign In
          </Button>
        </form>

        {/* Super Admin Quick Credentials */}
        <div className="mt-8 pt-6 border-t border-line">
          <p className="text-xs font-semibold uppercase tracking-widest text-navy-400 mb-3 text-center">
            Super Admin Access
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
      </CardContent>

      <CardFooter className="justify-center text-xs text-navy-600">
        Want to sell on Cartigo?{" "}
        <a href="/reseller" className="font-semibold text-navy-900 underline ml-1 hover:text-amber-600">
          Apply as Reseller
        </a>
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
