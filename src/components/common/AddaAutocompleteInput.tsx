"use client";

import React, { useState, useEffect, useRef } from "react";
import { MASTER_ADDAS, AddaDef, matchAddas } from "@/lib/addas";

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
  placeholder = "Type here... (e.g. n:guwahati)",
  className = "",
  isTextArea = false,
  rows = 3,
  onSelectAdda,
}: AddaAutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<AddaDef[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [triggerQuery, setTriggerQuery] = useState("");
  const [triggerStartIndex, setTriggerStartIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Detect when user types "n:" or "n:..."
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const text = e.target.value;
    onChange(text);

    const cursor = e.target.selectionStart || text.length;
    const textBeforeCursor = text.slice(0, cursor);

    // Find the last word before cursor
    const lastWordMatch = textBeforeCursor.match(/(?:^|\s)(n:[a-z0-9_-]*)$/i);

    if (lastWordMatch) {
      const fullMatch = lastWordMatch[1]; // e.g. "n:gu"
      const startIndex = textBeforeCursor.lastIndexOf(fullMatch);
      setTriggerQuery(fullMatch);
      setTriggerStartIndex(startIndex);

      const matched = matchAddas(fullMatch);
      if (matched.length > 0) {
        setSuggestions(matched);
        setShowPopup(true);
        setSelectedIndex(0);
        return;
      }
    }

    setShowPopup(false);
  };

  const handleSelect = (adda: AddaDef) => {
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
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showPopup || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex]);
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

      {/* Auto-suggest Dropdown Popover */}
      {showPopup && suggestions.length > 0 && (
        <div className="absolute left-0 mt-1 w-full max-w-sm bg-white dark:bg-slate-900 border border-emerald-500/40 dark:border-emerald-500/50 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span>⚡ Matching Addas</span>
            <span className="font-mono text-emerald-500">Tab / Enter to select</span>
          </div>

          <div className="max-h-48 overflow-y-auto p-1 space-y-1 scrollbar-none">
            {suggestions.map((adda, idx) => (
              <button
                key={adda.name}
                type="button"
                onClick={() => handleSelect(adda)}
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
          </div>
        </div>
      )}
    </div>
  );
}
