"use client";

import React, { useState, useEffect, useRef } from "react";
import { AddaDef, matchAddas } from "@/lib/addas";

export interface HashtagSuggestion {
  tag: string;
  count: number;
  isNew?: boolean;
}

interface AddaAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isTextArea?: boolean;
  rows?: number;
  onSelectAdda?: (adda: AddaDef) => void;
}

export default function AddaAutocompleteInput({
  value,
  onChange,
  placeholder = "Type here... (type n:adda or #hashtag)",
  className = "",
  isTextArea = false,
  rows = 3,
  onSelectAdda,
}: AddaAutocompleteInputProps) {
  const [addaSuggestions, setAddaSuggestions] = useState<AddaDef[]>([]);
  const [hashtagSuggestions, setHashtagSuggestions] = useState<HashtagSuggestion[]>([]);
  const [mode, setMode] = useState<"adda" | "hashtag" | null>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [triggerQuery, setTriggerQuery] = useState("");
  const [triggerStartIndex, setTriggerStartIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Search hashtags from API
  async function searchHashtags(query: string) {
    try {
      const clean = query.replace(/^#/, "").toLowerCase();
      const res = await fetch(`/api/community/hashtags?q=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.hashtags)) {
        const list: HashtagSuggestion[] = data.hashtags;
        // If clean typed query is not an exact match, offer "Create new tag"
        if (clean.length > 0 && !list.some((h) => h.tag.toLowerCase() === clean)) {
          list.push({ tag: clean, count: 0, isNew: true });
        }
        setHashtagSuggestions(list);
        setMode("hashtag");
        setShowPopup(list.length > 0);
        setSelectedIndex(0);
      }
    } catch {
      // Fallback: offer creating the typed hashtag
      const clean = query.replace(/^#/, "").toLowerCase();
      if (clean.length > 0) {
        setHashtagSuggestions([{ tag: clean, count: 0, isNew: true }]);
        setMode("hashtag");
        setShowPopup(true);
        setSelectedIndex(0);
      }
    }
  }

  // Handle typing to detect "n:..." or "#..."
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const text = e.target.value;
    onChange(text);

    const cursor = e.target.selectionStart || text.length;
    const textBeforeCursor = text.slice(0, cursor);

    // 1. Check for Adda trigger: "n:..."
    const addaMatch = textBeforeCursor.match(/(?:^|\s)(n:[a-z0-9_-]*)$/i);
    if (addaMatch) {
      const fullMatch = addaMatch[1];
      const startIndex = textBeforeCursor.lastIndexOf(fullMatch);
      setTriggerQuery(fullMatch);
      setTriggerStartIndex(startIndex);

      const matched = matchAddas(fullMatch);
      if (matched.length > 0) {
        setAddaSuggestions(matched);
        setMode("adda");
        setShowPopup(true);
        setSelectedIndex(0);
        return;
      }
    }

    // 2. Check for Hashtag trigger: "#..."
    const hashtagMatch = textBeforeCursor.match(/(?:^|\s)(#[a-z0-9_]*)$/i);
    if (hashtagMatch) {
      const fullMatch = hashtagMatch[1]; // e.g. "#kaz"
      const startIndex = textBeforeCursor.lastIndexOf(fullMatch);
      setTriggerQuery(fullMatch);
      setTriggerStartIndex(startIndex);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        searchHashtags(fullMatch);
      }, 150);
      return;
    }

    setShowPopup(false);
    setMode(null);
  };

  const handleSelectAdda = (adda: AddaDef) => {
    if (triggerStartIndex !== -1) {
      const before = value.slice(0, triggerStartIndex);
      const after = value.slice(triggerStartIndex + triggerQuery.length);
      const newText = `${before}${adda.name} ${after}`;
      onChange(newText);
    } else {
      onChange(adda.name);
    }

    if (onSelectAdda) {
      onSelectAdda(adda);
    }

    setShowPopup(false);
    setMode(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSelectHashtag = (hashtag: HashtagSuggestion) => {
    const tagText = `#${hashtag.tag}`;
    if (triggerStartIndex !== -1) {
      const before = value.slice(0, triggerStartIndex);
      const after = value.slice(triggerStartIndex + triggerQuery.length);
      const newText = `${before}${tagText} ${after}`;
      onChange(newText);
    } else {
      onChange(`${value} ${tagText} `);
    }

    setShowPopup(false);
    setMode(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showPopup) return;

    const count = mode === "adda" ? addaSuggestions.length : hashtagSuggestions.length;
    if (count === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % count);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + count) % count);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (mode === "adda" && addaSuggestions[selectedIndex]) {
        handleSelectAdda(addaSuggestions[selectedIndex]);
      } else if (mode === "hashtag" && hashtagSuggestions[selectedIndex]) {
        handleSelectHashtag(hashtagSuggestions[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowPopup(false);
    }
  };

  // Close popup if clicked outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPopup(false);
      }
    }
    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPopup]);

  return (
    <div className="relative w-full" ref={containerRef}>
      {isTextArea ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          className={className}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={className}
        />
      )}

      {/* Auto-suggest Popover for Addas and Hashtags */}
      {showPopup && (
        <div className="absolute left-0 mt-1 w-full max-w-sm bg-white dark:bg-slate-900 border border-emerald-500/40 dark:border-emerald-500/50 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span>{mode === "adda" ? "🌿 Matching Addas" : "# Trending Hashtags"}</span>
            <span className="font-mono text-emerald-500">Tab / Enter to select</span>
          </div>

          <div className="max-h-48 overflow-y-auto p-1 space-y-1 scrollbar-none">
            {/* 1. Adda suggestions */}
            {mode === "adda" &&
              addaSuggestions.map((adda, idx) => (
                <button
                  key={adda.name}
                  type="button"
                  onClick={() => handleSelectAdda(adda)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition cursor-pointer ${
                    selectedIndex === idx
                      ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700/60 shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base shrink-0">{adda.icon}</span>
                    <div className="min-w-0">
                      <p className="font-mono font-bold text-xs truncate">{adda.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                        {adda.title} &bull; {adda.state}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono shrink-0 ml-2 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                    {adda.tag}
                  </span>
                </button>
              ))}

            {/* 2. Hashtag suggestions */}
            {mode === "hashtag" &&
              hashtagSuggestions.map((item, idx) => (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => handleSelectHashtag(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition cursor-pointer ${
                    selectedIndex === idx
                      ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700/60 shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm shrink-0">
                      #
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono font-bold text-xs truncate">#{item.tag}</p>
                      {item.isNew ? (
                        <p className="text-[10px] text-amber-500 font-semibold truncate">
                          ✨ Create new hashtag
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                          Northeast Community Tag
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono shrink-0 ml-2 px-2 py-0.5 rounded-full border ${
                      item.isNew
                        ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800/60 font-bold"
                        : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                    }`}
                  >
                    {item.isNew ? "New Tag" : `${item.count} posts`}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
