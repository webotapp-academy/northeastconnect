"use client";

import React, { useState } from "react";
import { MASTER_ADDAS } from "@/lib/addas";

export default function GroupSubmitForm() {
  const [groupName, setGroupName] = useState("");
  const [platform, setPlatform] = useState<"whatsapp" | "telegram">("whatsapp");
  const [inviteLink, setInviteLink] = useState("");
  const [addaSlug, setAddaSlug] = useState("");
  const [description, setDescription] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/community/groups/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName, platform, inviteLink, addaSlug, description, submitterName }),
      });
      const data = await res.json();
      if (data.status !== "success") {
        setErrorMsg(data.message || "Something went wrong");
        setStatus("error");
        return;
      }
      setStatus("done");
      setGroupName("");
      setInviteLink("");
      setDescription("");
    } catch {
      setErrorMsg("Network error — try again");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 text-sm text-emerald-800 dark:text-emerald-300">
        Thanks — your group is submitted for review. Real, active groups get listed here after a quick manual check.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          required
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Group name (e.g. Guwahati Foodies)"
          className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
        />
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as "whatsapp" | "telegram")}
          className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100"
        >
          <option value="whatsapp">WhatsApp</option>
          <option value="telegram">Telegram</option>
        </select>
      </div>
      <input
        required
        value={inviteLink}
        onChange={(e) => setInviteLink(e.target.value)}
        placeholder={platform === "whatsapp" ? "https://chat.whatsapp.com/..." : "https://t.me/..."}
        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select
          value={addaSlug}
          onChange={(e) => setAddaSlug(e.target.value)}
          className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100"
        >
          <option value="">Related Adda (optional)</option>
          {MASTER_ADDAS.map((a) => (
            <option key={a.id} value={a.id}>{a.title}</option>
          ))}
        </select>
        <input
          value={submitterName}
          onChange={(e) => setSubmitterName(e.target.value)}
          placeholder="Your name / contact (not shown publicly)"
          className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
        />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What's this group about? (shown publicly once approved)"
        rows={2}
        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 resize-none"
      />
      {errorMsg && <p className="text-xs text-red-600 dark:text-red-400">{errorMsg}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-xl text-sm font-extrabold transition"
      >
        {status === "loading" ? "Submitting..." : "Submit group for review"}
      </button>
    </form>
  );
}
