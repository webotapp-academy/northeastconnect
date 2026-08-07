"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Suggestion {
  label: string;
  type: string;
  id: number | string;
  url: string;
}

interface HeroSearchProps {
  placeholder?: string;
  actionUrl?: string;
  buttonBgColor?: string;
  focusBorderColor?: string;
  defaultValue?: string;
}

export default function HeroSearch({
  placeholder = "Search destinations, experiences, or places to stay...",
  actionUrl = "/search",
  buttonBgColor = "bg-emerald-700 hover:bg-emerald-800",
  focusBorderColor = "focus:border-emerald-500",
  defaultValue = "",
}: HeroSearchProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Helper for tag badge color matching legacy getTagColor()
  const getTagColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "wildlife":
        return "bg-green-100 text-green-800 border-green-200";
      case "culture":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "adventure":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "directory":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "news":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Debounced autocomplete fetch
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?term=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(Array.isArray(data) ? data : []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Autocomplete error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      setIsOpen(false);
      router.push(`${actionUrl}?term=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleSelectSuggestion = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto relative group w-full text-left">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        {/* Search Icon */}
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className={`w-full pl-14 pr-36 py-5 rounded-full text-base sm:text-lg border-2 border-transparent ${focusBorderColor} focus:outline-none shadow-2xl bg-white/95 backdrop-blur-sm text-gray-900 transition duration-300`}
        />

        {/* Action Controls */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2 z-10">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
              className="text-gray-400 hover:text-gray-600 p-2 text-sm font-bold cursor-pointer"
              title="Clear search"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            className={`${buttonBgColor} text-white px-8 py-3 rounded-full transition duration-300 font-semibold cursor-pointer text-sm shadow-md`}
          >
            Search
          </button>
        </div>
      </form>

      {/* Live Suggestions Dropdown matching legacy search.php */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto divide-y divide-gray-100 p-2 text-left">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500 font-medium">Searching...</div>
          ) : suggestions.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500 font-medium">
              No matching suggestions found for &quot;{query}&quot;
            </div>
          ) : (
            suggestions.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectSuggestion(item.url)}
                className="px-4 py-3 hover:bg-emerald-50/80 cursor-pointer rounded-xl transition duration-150 flex items-center justify-between gap-4 group/item"
              >
                <div className="text-sm font-semibold text-gray-900 group-hover/item:text-emerald-700 truncate flex-1">
                  {item.label}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shrink-0 ${getTagColor(item.type)}`}>
                  {item.type}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
