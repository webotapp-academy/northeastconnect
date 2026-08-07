"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileOpen]);

  return (
    <>
      <nav className="absolute top-0 left-0 right-0 z-50 px-4 py-6">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-xl font-semibold text-white flex items-center space-x-2">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 12l-10-5 10 5 10-5v7l-10 5z" />
            </svg>
            <span>North East Connect</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link href="/culture" className="text-white hover:text-gray-200 transition font-medium">
              Culture
            </Link>
            <Link href="/wildlife" className="text-white hover:text-gray-200 transition font-medium">
              Wildlife
            </Link>
            <Link href="/adventure" className="text-white hover:text-gray-200 transition font-medium">
              Adventure
            </Link>
            <Link href="/directory" className="text-white hover:text-gray-200 transition font-medium">
              Directory
            </Link>
            <Link href="/news" className="text-white hover:text-gray-200 transition font-medium">
              News
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden hamburger cursor-pointer"
            aria-label="Open menu"
            type="button"
          >
            <span className="block w-6 h-0.5 bg-white my-1" />
            <span className="block w-6 h-0.5 bg-white my-1" />
            <span className="block w-6 h-0.5 bg-white my-1" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center transition-opacity"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileOpen(false);
          }}
        >
          <div className="bg-white w-[92vw] max-w-[370px] rounded-[18px] p-8 relative text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-blue-600 text-2xl font-bold focus:outline-none"
              aria-label="Close menu"
            >
              &times;
            </button>
            <div className="text-2xl font-bold mb-6 text-gray-800">Menu</div>
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="py-3 bg-gray-100 text-gray-900 rounded-xl font-medium text-lg hover:bg-gray-200 hover:text-blue-600 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/culture"
                onClick={() => setMobileOpen(false)}
                className="py-3 bg-gray-100 text-gray-900 rounded-xl font-medium text-lg hover:bg-gray-200 hover:text-blue-600 transition-colors"
              >
                Culture
              </Link>
              <Link
                href="/wildlife"
                onClick={() => setMobileOpen(false)}
                className="py-3 bg-gray-100 text-gray-900 rounded-xl font-medium text-lg hover:bg-gray-200 hover:text-blue-600 transition-colors"
              >
                Wildlife
              </Link>
              <Link
                href="/adventure"
                onClick={() => setMobileOpen(false)}
                className="py-3 bg-gray-100 text-gray-900 rounded-xl font-medium text-lg hover:bg-gray-200 hover:text-blue-600 transition-colors"
              >
                Adventure
              </Link>
              <Link
                href="/directory"
                onClick={() => setMobileOpen(false)}
                className="py-3 bg-gray-100 text-gray-900 rounded-xl font-medium text-lg hover:bg-gray-200 hover:text-blue-600 transition-colors"
              >
                Directory
              </Link>
              <Link
                href="/news"
                onClick={() => setMobileOpen(false)}
                className="py-3 bg-gray-100 text-gray-900 rounded-xl font-medium text-lg hover:bg-gray-200 hover:text-blue-600 transition-colors"
              >
                News
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
