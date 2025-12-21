"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Users, LayoutGrid, Globe, Lock, Calendar } from "lucide-react";
import { IComp } from "@/types"; // Tanımladığımız tipi import ediyoruz

export default function SearchPage() {
  // any[] yerine IComp[] kullanarak tip güvenliğini sağlıyoruz
  const [comps, setComps] = useState<IComp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/comps/list")
      .then((res) => res.json())
      .then((data) => {
        setComps(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = comps.filter((c) =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Başlık Bölümü */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-white flex items-center justify-center gap-3 uppercase italic tracking-tighter">
            <LayoutGrid className="text-yellow-500" />
            Browse Compositions
          </h1>
          <p className="text-slate-500 font-medium">
            Explore public and protected team builds
          </p>
        </div>

        {/* Arama Çubuğu */}
        <div className="relative max-w-2xl mx-auto group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-500 transition-colors"
            size={20}
          />
          <input
            className="w-full bg-slate-900 border border-slate-800 p-4 pl-12 rounded-2xl outline-none focus:border-yellow-500 transition-all text-lg shadow-2xl font-bold italic"
            placeholder="Search build name..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Grid Sistemi */}
        {loading ? (
          <div className="text-center py-20 text-slate-600 font-black tracking-widest animate-pulse uppercase italic">
            LOADING...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((comp) => (
              <Link href={`/comp/${comp._id}`} key={comp._id}>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-yellow-500/50 hover:bg-slate-800/40 transition-all group flex flex-col justify-between h-44 shadow-lg relative overflow-hidden">
                  <div>
                    <h3 className="text-xl font-black text-slate-200 group-hover:text-white truncate transition-colors uppercase italic tracking-tighter">
                      {comp.title || "Untitled Build"}
                    </h3>
                    <p className="text-[10px] text-slate-600 font-black flex items-center gap-1 mt-1 uppercase tracking-widest">
                      <Calendar size={10} />
                      {comp.createdAt
                        ? new Date(comp.createdAt).toLocaleDateString()
                        : "Unknown Date"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between font-black text-[11px] uppercase tracking-wider italic">
                    <div className="flex items-center gap-1.5 text-blue-400 bg-blue-500/5 px-2.5 py-1.5 rounded-xl border border-blue-500/10 shadow-sm">
                      <Users size={14} /> {comp.slots?.length || 0} Players
                    </div>

                    {comp.viewerPassword ? (
                      <div className="flex items-center gap-1.5 text-red-500 bg-red-500/5 px-2.5 py-1.5 rounded-xl border border-red-500/10 shadow-sm">
                        <Lock size={14} /> Protected
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-green-500 bg-green-500/5 px-2.5 py-1.5 rounded-xl border border-green-500/10 shadow-sm">
                        <Globe size={14} /> Open
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-slate-600 font-bold uppercase italic tracking-widest border border-dashed border-slate-800 rounded-3xl">
            No compositions found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
