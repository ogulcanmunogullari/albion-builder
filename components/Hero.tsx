"use client";

import { useState } from "react";
import Link from "next/link"; // Next.js Link
import { motion, AnimatePresence } from "framer-motion"; // Animasyonlar
import { PlusCircle, Search, PlayCircle, X } from "lucide-react"; // İkonlar

export default function Hero() {
  // Video Modal State'i
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // BURAYA YOUTUBE VIDEO ID'Nİ YAZ (Linkin sonundaki v= kodu)
  const YOUTUBE_VIDEO_ID = "k1w4r9ZYLA4";

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-4 space-y-12 overflow-hidden relative">
      {/* Animasyonlu Baltalar Konteynırı */}
      <div className="relative flex items-center justify-center w-full ">
        {/* Sol Balta - Soldan dönerek gelir */}
        <motion.img
          src="/halberd.png"
          alt="Halberd Left"
          className="absolute -mt-50  w-32 h-32 lg:w-48 lg:h-48 z-0 opacity-50 lg:opacity-100"
          initial={{ x: -1920, rotate: 0, opacity: 0, scale: 0.5 }}
          animate={{ x: 140, rotate: -720, opacity: 1, scale: 2.5 }}
          transition={{ duration: 1, type: "tween", ease: "linear" }}
          style={{ left: "50%", marginLeft: "-250px" }}
        />

        {/* Sağ Balta - Sağdan dönerek gelir */}
        <motion.img
          src="/halberd.png"
          alt="Halberd Right"
          className="absolute -mt-50 w-32 h-32 lg:w-48 lg:h-48 z-0 scale-x-[-1]"
          // BURASI KRİTİK: Pozitif değer sağdan gelmesini sağlar
          initial={{ x: -1920, rotate: 0, opacity: 0, scale: 0.5 }}
          animate={{ x: 320, rotate: 720, opacity: 1, scale: 2.5 }}
          transition={{ duration: 1, type: "tween", ease: "linear" }}
          // BURAYA DİKKAT: marginLeft pozitif olmalı ki merkezden SAĞA doğru itilsin
          style={{ left: "50%", marginLeft: "250px" }}
        />

        {/* Ana İçerik (Z-index ile en üstte) */}
        <div className="relative z-10 space-y-6 max-w-3xl">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl lg:text-7xl font-black text-white leading-tight"
          >
            Master Your{" "}
            {/* Not: bg-linear-to-r Tailwind standardında bg-gradient-to-r olabilir, 
                ama senin config'ine dokunmadım */}
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
      <div className="flex flex-col items-center justify-center sm:flex-row gap-4 w-full relative z-10">
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

        {/* VIDEO BUTONU - STATE'I TETIKLIYOR */}
        <button
          onClick={() => setIsVideoOpen(true)}
          className="group flex items-center gap-2 px-6 py-4 text-slate-400 hover:text-white font-bold uppercase italic text-sm transition-all hover:scale-105"
        >
          <div className="p-2 rounded-full bg-slate-800 group-hover:bg-red-600 transition-colors">
            <PlayCircle size={20} className="text-white" />
          </div>
          <span>How to use?</span>
        </button>
      </div>

      {/* --- VIDEO MODAL (YOUTUBE) --- */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setIsVideoOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Kapat Butonu */}
              <div className="absolute -top-12 right-0 md:top-4 md:right-4 z-20">
                <button
                  onClick={() => setIsVideoOpen(false)}
                  className="p-2 bg-white/10 hover:bg-red-600 text-white rounded-full transition-colors backdrop-blur-md"
                >
                  <X size={24} />
                </button>
              </div>
              {/* YouTube Iframe */}
              <div className="aspect-video w-full bg-black">
                <iframe
                  className="w-full h-full"
                  // GÜNCELLENEN PARAMETRELER:
                  // autoplay=1       -> Otomatik başlar
                  // controls=0       -> Alt barı (ayarlar, play butonu, süre) TAMAMEN GİZLER
                  // rel=0            -> Video bitince saçma videolar önermez
                  // modestbranding=1 -> YouTube logosunu minimal tutar
                  // iv_load_policy=3 -> Video içindeki notları/yazıları gizler
                  src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&controls=0&rel=0&modestbranding=1&iv_load_policy=3`}
                  title="Tutorial Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
