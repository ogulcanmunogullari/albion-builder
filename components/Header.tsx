"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coins, Search, PlusCircle, Home } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  // Ana sayfada Header'ı gösterme
  if (pathname === "/") return null;

  return (
    <header className="w-full bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        {/* LOGO AREA (Attığın resimdeki stil) */}
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center gap-2">
          <Link href="/">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-500 to-amber-700">
              Albion Composition Maker by KOMANDO35
            </h1>
          </Link>
          <p className="flex items-center justify-center gap-2 text-slate-500 text-xs">
            <Coins size={14} className="text-yellow-600" />
            For donation, use in-game mail or dm on{" "}
            <span className="text-yellow-600 font-bold">
              Europe Server
            </span> to{" "}
            <span className="text-slate-200 font-bold">KOMANDO35</span>
          </p>
        </div>

        {/* MENU LINKS */}
        <nav className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white font-bold text-sm transition"
          >
            <Home size={18} /> Home
          </Link>
          <Link
            href="/search"
            className="flex items-center gap-2 text-slate-400 hover:text-white font-bold text-sm transition"
          >
            <Search size={18} /> Browse Compositions
          </Link>
          <Link
            href="/create-composition"
            className="flex items-center gap-2 bg-yellow-600/10 text-yellow-500 px-4 py-2 rounded-xl font-bold text-sm transition border border-yellow-600/20"
          >
            <PlusCircle size={18} /> Create New Composition
          </Link>
        </nav>
      </div>
    </header>
  );
}
