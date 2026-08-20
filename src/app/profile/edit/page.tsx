"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function EditProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Form states
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  useEffect(() => {
    fetchMe();
  }, []);

  async function fetchMe() {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.status === "success" && data.user) {
        const u = data.user;
        setCurrentUser(u);
        setFullName(u.fullName || "");
        setBio(u.bio || "");
        setState(u.state || "");
        setCity(u.city || "");
        setProfileImageUrl(u.profileImageUrl || "");
        setCoverImageUrl(u.coverImageUrl || "");
        setWebsiteUrl(u.websiteUrl || "");
        setMobileNumber(u.mobileNumber || "");
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          bio,
          state,
          city,
          profileImageUrl,
          coverImageUrl,
          websiteUrl,
          mobileNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      setSuccessMsg("Profile saved successfully!");
      setTimeout(() => {
        router.push(`/profile/${currentUser.username}`);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-gray-900 flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pt-28 pb-16 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Edit Explorer Profile</h1>
              <p className="text-xs text-slate-400 mt-1">
                Customize your bio, Northeast location, avatar, and social links.
              </p>
            </div>
            {currentUser && (
              <Link
                href={`/profile/${currentUser.username}`}
                className="text-xs text-emerald-400 font-semibold hover:underline"
              >
                View Profile &rarr;
              </Link>
            )}
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 bg-emerald-950/70 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2 font-medium">
              <span>✨</span> {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs outline-none focus:border-emerald-500 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mobile Number (Optional)
                </label>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs outline-none focus:border-emerald-500 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* State & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  State in Northeast
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs outline-none focus:border-emerald-500 focus:bg-slate-900 cursor-pointer"
                >
                  <option value="">Select State</option>
                  {NE_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  City / Town
                </label>
                <input
                  type="text"
                  placeholder="e.g. Guwahati, Shillong, Kohima"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs outline-none focus:border-emerald-500 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                About / Bio
              </label>
              <textarea
                rows={3}
                placeholder="Share a short bio about yourself and your travels or favorite spots in the Northeast..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs outline-none focus:border-emerald-500 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500 resize-none placeholder-slate-500 leading-relaxed"
              />
            </div>

            {/* Avatar & Cover URLs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Profile Picture URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={profileImageUrl}
                  onChange={(e) => setProfileImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs outline-none focus:border-emerald-500 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs outline-none focus:border-emerald-500 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
                />
              </div>
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Personal Website or Blog
              </label>
              <input
                type="url"
                placeholder="https://yourblog.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs outline-none focus:border-emerald-500 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
              <Link
                href={`/profile/${currentUser?.username}`}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition border border-slate-700"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
