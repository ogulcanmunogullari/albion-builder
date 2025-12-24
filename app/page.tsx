"use client";

import Link from "next/link";
import { PlusCircle, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-4 space-y-12 overflow-hidden">
      {/* Animasyonlu Baltalar Konteynırı */}
      <div className="relative flex items-center justify-center w-full ">
        {/* Sol Balta - Soldan dönerek gelir */}
        <motion.img
          src="/halberd.png"
          alt="Halberd Left"
          className="absolute -mt-80  w-32 h-32 lg:w-48 lg:h-48 z-0 opacity-50 lg:opacity-100"
          initial={{ x: -1920, rotate: 0, opacity: 0 }}
          animate={{ x: 140, rotate: -360, opacity: 1 }}
          transition={{ type: "tween", stiffness: 75 }}
          style={{ left: "50%", marginLeft: "-250px", scale: 2 }}
        />

        {/* Sağ Balta - Sağdan dönerek gelir */}
        <motion.img
          src="/halberd.png"
          alt="Halberd Right"
          className="absolute -mt-80 w-32 h-32 lg:w-48 lg:h-48 z-0 scale-x-[-1]"
          // BURASI KRİTİK: Pozitif değer sağdan gelmesini sağlar
          initial={{ x: -1920, rotate: 0, opacity: 0 }}
          animate={{ x: 320, rotate: 360, opacity: 1 }}
          transition={{ type: "tween", stiffness: 75 }}
          // BURAYA DİKKAT: marginLeft pozitif olmalı ki merkezden SAĞA doğru itilsin
          style={{ left: "50%", marginLeft: "250px", scale: 2 }}
        />
        {/* Ana İçerik (Z-index ile en üstte) */}
        <div className="relative z-10 space-y-6 max-w-3xl">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl lg:text-7xl font-black text-white leading-tight"
          >
            Master Your{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-500 to-amber-700">
              Albion Compositions
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-slate-400 text-lg lg:text-xl font-medium"
          >
            Create, manage, and share professional team builds for Albion
            Online.
          </motion.p>
        </div>
      </div>

      {/* Butonlar */}
      <div
        className="flex flex-col items-center
      justify-center sm:flex-row gap-4 w-full relative z-10"
      >
        <Link
          href="/create-composition"
          className="flex w-100 items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-black font-black py-4 px-8 rounded-2xl transition-all text-lg shadow-lg shadow-yellow-600/20 active:scale-95"
        >
          <PlusCircle size={36} /> Create New Composition
        </Link>
        <Link
          href="/search"
          className=" flex w-100 items-center justify-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-black py-4 px-8 rounded-2xl transition-all text-lg active:scale-95"
        >
          <Search size={36} /> Browse Compositions
        </Link>
      </div>
    </div>
  );
}
