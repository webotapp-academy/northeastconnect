"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

const NE_STATES = [
  "Assam",
  "Arunachal Pradesh",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Sikkim",
  "Tripura",
  "Other / Outside NE",
];

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [state, setState] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          fullName,
          state,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create account");

      router.push(`/profile/${data.user.username}`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex items-center justify-center p-4 pt-28 pb-16">
      <div className="w-full max-w-lg bg-white border border-gray-200/90 rounded-3xl p-8 shadow-lg animate-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-2xl mb-3 shadow-md text-white">
            🏔️
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create Your Account</h1>
          <p className="text-xs text-gray-500 mt-1">
            Join the Northeast community, make friends, comment on listings & earn XP
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

        {/* Google One-Click Sign Up */}
        <div className="mb-5">
          <GoogleSignInButton
            text="Sign up with Google (+30 XP)"
            onError={(err) => setErrorMsg(err)}
          />

          <div className="relative my-5 flex items-center justify-center">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-3 text-xs font-bold text-gray-400 uppercase tracking-wider absolute">
              or register with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Username <span className="text-emerald-600">(@unique)</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. kaziranga_scout"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 text-gray-900 placeholder:text-gray-400 outline-none text-xs transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 text-gray-900 placeholder:text-gray-400 outline-none text-xs transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 text-gray-900 placeholder:text-gray-400 outline-none text-xs transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              State in Northeast (or Location)
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-300 focus:border-emerald-500 text-gray-900 outline-none text-xs transition"
            >
              <option value="">Select State (Optional)</option>
              {NE_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 text-gray-900 placeholder:text-gray-400 outline-none text-xs transition"
            />
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs">
            <span className="text-base">🎁</span>
            <span>You&apos;ll immediately unlock the <strong>Explorer Novice</strong> Rank and +20 XP upon joining!</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 text-sm mt-2 cursor-pointer"
          >
            {loading ? "Creating Account..." : "Create Free Account (+20 XP)"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center text-xs text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-700 font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
