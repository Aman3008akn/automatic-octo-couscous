"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signUpError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message || "Failed to create account.");
    } else {
      if (data.session) {
        // Automatically logged in
        router.push(callbackUrl);
        router.refresh();
      } else {
        // Email verification required
        setSuccess(true);
      }
    }
  }

  return (
    <Card className="w-full shadow-lg border-navy-100">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-card bg-navy-900 text-amber-400 font-display font-bold text-2xl">
          C
        </div>
        <CardTitle className="text-2xl font-display">Create an Account</CardTitle>
        <CardDescription>
          Join Cartigo to track your orders and checkout faster.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        {error && (
          <div className="mb-4 rounded-card bg-danger/10 border border-danger/20 p-3 text-xs text-danger font-medium">
            {error}
          </div>
        )}

        {success ? (
          <div className="rounded-card bg-success/10 border border-success/20 p-4 text-center">
            <h3 className="font-bold text-success mb-2">Check your email</h3>
            <p className="text-xs text-navy-700">
              We sent a verification link to <strong>{email}</strong>. Please click the link to verify your account before logging in.
            </p>
            <Button
              onClick={() => router.push("/login")}
              className="mt-4 w-full py-2 text-sm"
              variant="outline"
            >
              Go to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-400/20"
              />
            </div>

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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none transition focus:border-navy-400 focus:ring-2 focus:ring-navy-400/20"
              />
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2 py-2.5 text-sm">
              Create Account
            </Button>
            
            <div className="relative my-2 flex items-center py-2">
              <div className="flex-grow border-t border-line"></div>
              <span className="shrink-0 px-3 text-xs text-navy-400 uppercase tracking-widest font-bold">Or</span>
              <div className="flex-grow border-t border-line"></div>
            </div>

            <Link href="/login" className="w-full">
              <Button type="button" variant="outline" className="w-full text-sm py-2.5">
                Sign up with Phone Number
              </Button>
            </Link>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-2 justify-center text-xs text-navy-600 mt-2">
        <div>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-navy-900 underline ml-1 hover:text-amber-600">
            Log In
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col items-center justify-center p-6">
      <Suspense fallback={<div className="p-8 text-center text-xs text-navy-600 animate-pulse">Loading...</div>}>
        <SignupForm />
      </Suspense>
    </main>
  );
}
