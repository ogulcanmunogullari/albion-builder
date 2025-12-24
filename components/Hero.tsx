"use client";

import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  const swordImg = "/halberd.png";

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden px-4 bg-slate-950">
      {/* 1. ARKA PLAN EFEKTLERİ (GLOW) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-purple-600/10 blur-[120px] rounded-full" />

        {/* Çarpışma Anı Patlaması (Flash) */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 2, 0] }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-25 h-25 bg-yellow-500/50 blur-[30px] rounded-full"
        />
      </div>

      {/* 2. KILIÇ ÇARPIŞMA ALANI */}
      <div className="relative w-full max-w-150 h-75 flex items-center justify-center mb-8">
        {/* SOL KILIÇ: Sağdan Sola Gelir */}
        <motion.img
          src={swordImg}
          initial={{ x: -1000, y: 0, rotate: -90, opacity: 0 }}
          animate={{ x: -60, y: 0, rotate: -30, opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.1,
            type: "spring",
            stiffness: 150,
            damping: 15,
          }}
          className="absolute w-80 h-80 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,1)]"
          style={{ originX: 0.5, originY: 0.5 }}
        />

        {/* SAĞ KILIÇ: Soldan Sağa Gelir */}
        <motion.img
          src={swordImg}
          initial={{ x: 1000, y: 0, rotate: 90, opacity: 0 }}
          animate={{ x: 60, y: 0, rotate: 30, opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.1,
            type: "spring",
            stiffness: 150,
            damping: 15,
          }}
          // scale-x-[-1] ile sağdaki kılıcı aynalıyoruz
          className="absolute w-80 h-80 object-contain scale-x-[-1] drop-shadow-[0_20px_50px_rgba(0,0,0,1)]"
          style={{ originX: 0.5, originY: 0.5 }}
        />
      </div>

      {/* 3. BAŞLIK VE TEXT */}
      <div className="text-center z-10 space-y-6">
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="text-6xl md:text-9xl font-black tracking-tighter italic uppercase leading-[0.8]"
        >
          Master Your <br />
          <span className="text-transparent bg-clip-text bg-linear-to-b from-yellow-400 via-orange-500 to-red-700">
            ALBION
          </span>
          <br /> Compositions
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-slate-400 text-sm md:text-xl font-bold max-w-xl mx-auto italic tracking-tight uppercase"
        >
          Create and share professional team builds. <br />
          Dominating the outlands starts here.
        </motion.p>

        {/* 4. YAN YANA BUTONLAR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="flex flex-row items-center justify-center gap-4 pt-6"
        >
          {/* Create Button */}
          <Link
            href="/composition/create"
            className="flex items-center gap-3 px-8 py-4 bg-yellow-600 hover:bg-yellow-500 text-black font-black uppercase italic rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(202,138,4,0.4)]"
          >
            <Plus size={24} strokeWidth={3} />
            <span className="text-base">Create Setup</span>
          </Link>

          {/* Browse Button */}
          <Link
            href="/browse"
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 border-2 border-slate-800 hover:border-slate-600 text-white font-black uppercase italic rounded-2xl transition-all hover:scale-105 active:scale-95"
          >
            <Search size={22} strokeWidth={3} className="text-yellow-500" />
            <span className="text-base">Browse</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
