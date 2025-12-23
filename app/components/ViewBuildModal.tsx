"use client";

import React from "react";
import { X, ShieldCheck, RefreshCw, Sword } from "lucide-react";
import { ISlot, ICategorizedItems, IItem, IBuild } from "@/types";
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

  // Item kartlarını render eden yardımcı fonksiyon
  const renderBuildColumn = (
    build: IBuild | undefined,
    title: string,
    isSwap: boolean = false
  ) => {
    if (!build && isSwap) return null; // Swap build yoksa o sütunu gösterme

    return (
      <div className="flex-1 space-y-4">
        <div
          className={`flex items-center gap-2 pb-2 border-b ${
            isSwap ? "border-yellow-500/30" : "border-blue-500/30"
          }`}
        >
          {isSwap ? (
            <RefreshCw size={16} className="text-yellow-500" />
          ) : (
            <Sword size={16} className="text-blue-400" />
          )}
          <h3
            className={`font-black uppercase italic tracking-tighter ${
              isSwap ? "text-yellow-500" : "text-blue-400"
            }`}
          >
            {title}
          </h3>
        </div>

        <div className="space-y-2">
          {VIEW_SLOTS.map((conf) => {
            const itemId = build ? build[conf.key as keyof IBuild] : null;
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
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50 hover:border-slate-700 transition group"
              >
                <div className="w-10 h-10 bg-black rounded border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-inner group-hover:border-slate-500 transition-colors">
                  <ItemLoader
                    src={`https://render.albiononline.com/v1/item/${itemId}?quality=4`}
                    alt={itemName}
                    size={38}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] text-slate-500 font-black uppercase tracking-tight leading-none mb-1">
                    {conf.label}
                  </div>
                  <div className="text-[11px] text-slate-200 font-bold truncate leading-tight uppercase italic">
                    {itemName}
                  </div>
                </div>
                <div className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded font-mono text-[16px] font-black">
                  <span className="text-amber-600">{tier}</span>
                  <span className="text-slate-500">.</span>
                  <span className="text-yellow-500">{enchantment}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[600] backdrop-blur-xl p-4">
      {/* Genişliği dual view için max-w-4xl yaptık */}
      <div className="bg-slate-900 w-full max-w-4xl rounded-[32px] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-800/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500 shadow-inner">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">
                {slot.role} Tactical Loadout
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-500/10 rounded-full transition-all text-slate-500 hover:text-red-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar bg-gradient-to-b from-slate-900 to-slate-950">
          <div
            className={`flex flex-col md:flex-row gap-8 ${
              slot.swapBuild ? "divide-x divide-slate-800/50" : ""
            }`}
          >
            {/* MAIN BUILD COLUMN */}
            {renderBuildColumn(slot.build, "Primary Loadout")}

            {/* SWAP BUILD COLUMN (Sadece varsa sütun olarak görünür) */}
            {slot.swapBuild &&
              renderBuildColumn(slot.swapBuild, "Tactical Swap", true)}
          </div>

          {!slot.swapBuild && (
            <div className="mt-6 p-4 rounded-2xl bg-slate-950/30 border border-slate-800/50 text-center">
              <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest italic">
                No Tactical Swap Configured For This Slot
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-5 bg-slate-950/80 border-t border-slate-800 flex justify-between items-center">
          <div className="text-[10px] font-black text-slate-600 uppercase italic tracking-widest px-4">
            version 1.2.0
          </div>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-black rounded-xl transition-all text-xs uppercase tracking-widest italic border border-slate-700 shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
