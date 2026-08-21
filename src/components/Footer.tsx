"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-50 dark:bg-[#070a12] border-t border-slate-200/80 dark:border-slate-800/80 py-8 text-center text-xs transition-colors">
      <div className="container mx-auto px-4 max-w-4xl space-y-3">
        {/* Main Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 font-medium text-slate-700 dark:text-slate-300">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">Home</Link>
          <Link href="/addas" className="hover:text-slate-900 dark:hover:text-white transition-colors">Addas</Link>
          <Link href="/news" className="hover:text-slate-900 dark:hover:text-white transition-colors">News</Link>
          <Link href="/directory" className="hover:text-slate-900 dark:hover:text-white transition-colors">Directory</Link>
          <Link href="/culture" className="hover:text-slate-900 dark:hover:text-white transition-colors">Culture</Link>
          <Link href="/wildlife" className="hover:text-slate-900 dark:hover:text-white transition-colors">Wildlife</Link>
          <Link href="/adventure" className="hover:text-slate-900 dark:hover:text-white transition-colors">Adventure</Link>
          <Link href="/marketplace" className="hover:text-slate-900 dark:hover:text-white transition-colors">Marketplace</Link>
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <Link href="/contact" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Privacy Policy</Link>
          <Link href="/contact" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">User Agreement</Link>
          <Link href="/contact" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Guidelines</Link>
        </div>

        {/* Copyright */}
        <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
          North East Connect - A Brand of Webotapp Private Limited
        </div>
      </div>
    </footer>
  );
}
