"use client";

import React from "react";
import { X, ShieldCheck } from "lucide-react";
import { ISlot, ICategorizedItems, IItem } from "@/types";
import { getDisplayName } from "@/utils/helpers";
import ItemLoader from "@/components/ItemLoader";

interface ViewBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: ISlot | null;
  allItems: ICategorizedItems;
}

const VIEW_SLOTS = [
  { key: "mainHand", label: "Main Hand" },
  { key: "offHand", label: "Off Hand" },
  { key: "head", label: "Head" },
  { key: "armor", label: "Armor" },
  { key: "shoes", label: "Shoes" },
  { key: "cape", label: "Cape" },
  { key: "mount", label: "Mount" },
  { key: "food", label: "Food" },
  { key: "potion", label: "Potion" },
];

export default function ViewBuildModal({
  isOpen,
  onClose,
  slot,
  allItems,
}: ViewBuildModalProps) {
  if (!isOpen || !slot) return null;

  const flattenItems: IItem[] = Object.values(allItems).flat();

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md p-4">
      {/* Genişliği max-w-lg'den max-w-2xl'e çıkardık */}
      <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Build Overview
              </h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                {slot.role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT - GRID VIEW (2 Sütunlu Yapı) */}
        <div className="p-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {VIEW_SLOTS.map((conf) => {
              const itemId = slot.build[conf.key as keyof typeof slot.build];
              if (!itemId) return null;

              const tierMatch = itemId.match(/^T(\d+)/);
              const tier = tierMatch ? tierMatch[1] : "0";
              const enchantment = itemId.includes("@")
                ? itemId.split("@")[1]
                : "0";
              const itemName = getDisplayName(itemId, flattenItems);

              return (
                <div
                  key={conf.key}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition"
                >
                  {/* Küçük İkon */}
                  <div className="w-12 h-12 bg-black rounded-lg border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                    <ItemLoader
                      src={`https://render.albiononline.com/v1/item/${itemId}?quality=4`}
                      alt={itemName}
                      size={42}
                    />
                  </div>

                  {/* Metin Bilgileri */}
                  <div className="flex-1 min-w-0">
                    <div className=" text-slate-500 font-black uppercase tracking-tighter">
                      {conf.label}
                    </div>
                    <div className=" text-slate-100 font-bold truncate leading-tight">
                      {itemName}
                    </div>
                  </div>
                  <div className="mt-1 inline-block px-1.5 py-0.5 bg-yellow-600/10 border border-yellow-600/20 rounded  font-black font-mono">
                    <span className="text-amber-700">{tier}</span>.
                    <span className="text-yellow-500">{enchantment}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
