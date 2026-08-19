"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const errorParam = searchParams.get("error");

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(
    errorParam === "admin_required"
      ? "Admin access required. Please sign in with an administrator account."
      : errorParam === "unauthorized_role"
      ? "Access restricted to administrators only."
      : ""
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to sign in");

      const isAdmin =
        (data.user?.role || "").toLowerCase() === "admin" ||
        (data.user?.role || "").toLowerCase() === "superadmin";
      const destination =
        redirectParam || (isAdmin ? "/admin" : `/profile/${data.user.username}`);

      router.push(destination);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white border border-gray-200/90 rounded-3xl p-8 shadow-lg animate-in zoom-in-95 duration-200">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-2xl mb-3 shadow-sm">
          🌿
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h1>
        <p className="text-xs text-gray-500 mt-1">
          Sign in to your North East Connect account
        </p>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Email or Username
          </label>
          <input
            type="text"
            required
            placeholder="e.g. explorer_ne or wanderer@northeast.in"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 text-gray-900 placeholder:text-gray-400 outline-none text-sm transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 text-gray-900 placeholder:text-gray-400 outline-none text-sm transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 text-sm mt-2 cursor-pointer"
        >
          {loading ? "Signing In..." : "Sign In to Account"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-600">
        Don&apos;t have an account yet?{" "}
        <Link href="/register" className="text-emerald-700 font-bold hover:underline">
          Create account (+20 XP bonus)
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex items-center justify-center p-4 pt-28 pb-16">
      <Suspense fallback={<div className="text-gray-500 text-sm">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
