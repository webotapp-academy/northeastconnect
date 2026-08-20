"use client";

import React, { useState, useEffect } from "react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
  onSuccess?: () => void;
}

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

export default function AuthModal({
  isOpen,
  onClose,
  defaultTab = "login",
  onSuccess,
}: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">(defaultTab);

  // Form states
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regFullName, setRegFullName] = useState("");
  const [regState, setRegState] = useState("");
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaKey, setCaptchaKey] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
    if (tab === "register") {
      fetchCaptcha();
    }
  }, [tab]);

  if (!isOpen) return null;

  async function handleLogin(e: React.FormEvent) {
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
      if (!res.ok) throw new Error(data.message || "Failed to log in");

      if (onSuccess) onSuccess();
      onClose();
      window.location.reload();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword,
          fullName: regFullName,
          state: regState,
          captchaAnswer,
          captchaKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        fetchCaptcha();
        throw new Error(data.message || "Failed to register");
      }

      if (onSuccess) onSuccess();
      onClose();
      window.location.reload();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative border border-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with decorative background */}
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 text-white p-6 relative border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
            aria-label="Close"
          >
            &times;
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 bg-slate-800/80 backdrop-blur rounded-xl">🌿</span>
            <span className="font-semibold tracking-wide uppercase text-xs text-emerald-400">
              North East Connect
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">
            {tab === "login" ? "Welcome Back!" : "Join the Community"}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {tab === "login"
              ? "Sign in to comment, connect with friends, and level up your Explorer Rank."
              : "Create an account, earn your Explorer Novice badge (+30 XP), and join travelers & locals across Northeast India."}
          </p>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-2xl mt-4 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setErrorMsg("");
              }}
              className={`py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                tab === "login"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setErrorMsg("");
              }}
              className={`py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                tab === "register"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-950/70 border border-rose-800 text-rose-300 text-sm rounded-xl flex items-center gap-2">
              <svg className="w-5 h-5 text-rose-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Continue with Google Button */}
          <div className="mb-5">
            <GoogleSignInButton
              text={tab === "login" ? "Continue with Google" : "Sign up with Google"}
              onSuccess={() => {
                if (onSuccess) onSuccess();
                onClose();
                window.location.reload();
              }}
              onError={(err) => setErrorMsg(err)}
            />

            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider absolute">
                or
              </span>
            </div>
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email or Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. wanderer@northeast.in or explore_ne"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 focus:bg-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm text-slate-100 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 focus:bg-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm text-slate-100 placeholder-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 text-sm cursor-pointer"
              >
                {loading ? "Signing in..." : "Sign In with Password"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Username <span className="text-emerald-400 font-normal">(@unique)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. kaziranga_explorer"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 focus:bg-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm text-slate-100 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ananya Barman"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 focus:bg-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm text-slate-100 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 focus:bg-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm text-slate-100 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  State in Northeast (or Region)
                </label>
                <select
                  value={regState}
                  onChange={(e) => setRegState(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 focus:bg-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm text-slate-200 cursor-pointer"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 focus:bg-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm text-slate-100 placeholder-slate-500"
                />
              </div>

              {/* Security Captcha Challenge */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Security Verification
                  </label>
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    disabled={loadingCaptcha}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
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
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-100 placeholder:text-slate-500 outline-none text-xs font-mono font-bold tracking-widest uppercase transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-indigo-700 hover:from-emerald-500 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-md transition-all disabled:opacity-50 text-sm mt-2 cursor-pointer"
              >
                {loading ? "Creating Account..." : "Create Account & Get 20 XP"}
              </button>
            </form>
          )}

          <div className="mt-4 text-center text-xs text-slate-500">
            By continuing, you agree to North East Connect&apos;s Community Guidelines.
          </div>
        </div>
      </div>
    </div>
  );
}
