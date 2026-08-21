"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    checked: boolean;
    available?: boolean;
    message?: string;
  }>({ checked: false });

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [state, setState] = useState("");
  const [password, setPassword] = useState("");
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaKey, setCaptchaKey] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Live username availability check
  useEffect(() => {
    const clean = username.trim();
    if (!clean) {
      setUsernameStatus({ checked: false });
      setUsernameChecking(false);
      return;
    }

    if (clean.length < 3) {
      setUsernameStatus({
        checked: true,
        available: false,
        message: "Username must be at least 3 characters",
      });
      setUsernameChecking(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
      setUsernameStatus({
        checked: true,
        available: false,
        message: "Only letters, numbers, and _ allowed",
      });
      setUsernameChecking(false);
      return;
    }

    setUsernameChecking(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(clean)}`);
        const data = await res.json();
        setUsernameStatus({
          checked: true,
          available: data.available,
          message: data.message,
        });
      } catch {
        // Ignored
      } finally {
        setUsernameChecking(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [username]);

  async function fetchCaptcha() {
    try {
      setLoadingCaptcha(true);
      const res = await fetch("/api/auth/captcha");
      const data = await res.json();
      if (data.status === "success") {
        setCaptchaSvg(data.svg);
        setCaptchaKey(data.captchaKey);
        setCaptchaAnswer("");
      }
    } catch {
      // Ignored
    } finally {
      setLoadingCaptcha(false);
    }
  }

  useEffect(() => {
    fetchCaptcha();
  }, []);

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
          captchaAnswer,
          captchaKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        fetchCaptcha(); // Refresh captcha on failure
        throw new Error(data.message || "Failed to create account");
      }

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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Username <span className="text-emerald-600">(@unique)</span>
                </label>
                {usernameChecking && (
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                    <svg className="animate-spin w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Checking...
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. kaziranga_scout"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                  className={`w-full px-3.5 py-2.5 pr-8 rounded-xl bg-gray-50 border outline-none text-xs transition ${
                    usernameStatus.checked
                      ? usernameStatus.available
                        ? "border-emerald-500 bg-emerald-50/20 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        : "border-rose-500 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                      : "border-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  } text-gray-900 placeholder:text-gray-400`}
                />
                {usernameStatus.checked && !usernameChecking && (
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    {usernameStatus.available ? (
                      <span className="text-emerald-600 text-xs font-bold">✓</span>
                    ) : (
                      <span className="text-rose-500 text-xs font-bold">✕</span>
                    )}
                  </div>
                )}
              </div>
              {usernameStatus.checked && usernameStatus.message && (
                <p
                  className={`text-[10px] mt-1 font-medium transition ${
                    usernameStatus.available ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {usernameStatus.message}
                </p>
              )}
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

          {/* Security Captcha Challenge */}
          <div className="p-3 bg-slate-900/5 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700 rounded-2xl">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-200">
                Security Verification (Captcha)
              </label>
              <button
                type="button"
                onClick={fetchCaptcha}
                disabled={loadingCaptcha}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                title="Generate new captcha"
              >
                <span>↻</span> {loadingCaptcha ? "Loading..." : "New Code"}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="rounded-xl overflow-hidden shadow-xs border border-slate-700 bg-slate-950 flex items-center justify-center shrink-0 cursor-pointer"
                onClick={fetchCaptcha}
                title="Click to refresh"
                dangerouslySetInnerHTML={{ __html: captchaSvg || "<div class='p-2 text-xs text-white'>Loading...</div>" }}
              />
              <input
                type="text"
                required
                maxLength={6}
                placeholder="Enter 4 characters"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-gray-900 placeholder:text-gray-400 outline-none text-xs font-mono font-bold tracking-widest uppercase transition"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs">
            <span className="text-base">🎁</span>
            <span>You&apos;ll immediately unlock the <strong>Explorer Novice</strong> Rank and +20 XP upon joining!</span>
          </div>

          {/* Terms & Conditions Acceptance */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="terms-checkbox"
              required
              defaultChecked
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="terms-checkbox" className="text-xs text-gray-600 dark:text-slate-400 select-none cursor-pointer leading-tight">
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="text-emerald-600 font-bold hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="text-emerald-600 font-bold hover:underline">
                Privacy Policy
              </Link>{" "}
              of North East Connect.
            </label>
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
