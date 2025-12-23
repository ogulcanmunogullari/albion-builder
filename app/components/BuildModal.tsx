"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Search,
  ChevronRight,
  Shield,
  Sword,
  Shirt,
  Trash2,
  LucideIcon,
  RefreshCw,
} from "lucide-react";

import { ISlot, IBuild, ICategorizedItems, IItem } from "@/types";
import { constructItemId } from "@/utils/helpers";
import ItemLoader from "@/components/ItemLoader";

interface BuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: ISlot | null;
  onSave: (build: IBuild) => void;
  onSoftSave: (build: IBuild) => void; // Modalı kapatmayan kayıt fonksiyonu
  allItems: ICategorizedItems;
  readOnly?: boolean;
  mode: "main" | "swap";
  setModalMode: (mode: "main" | "swap") => void;
}

const SLOT_CONFIG: { key: keyof IBuild; label: string; icon: LucideIcon }[] = [
  { key: "mainHand", label: "Main Hand", icon: Sword },
  { key: "offHand", label: "Off Hand", icon: Shield },
  { key: "head", label: "Head", icon: Shirt },
  { key: "armor", label: "Armor", icon: Shirt },
  { key: "shoes", label: "Shoes", icon: Shirt },
  { key: "cape", label: "Cape", icon: Shirt },
  { key: "mount", label: "Mount", icon: Shirt },
  { key: "potion", label: "Potion", icon: Shirt },
  { key: "food", label: "Food", icon: Shirt },
];

export default function BuildModal({
  isOpen,
  onClose,
  slot,
  onSave,
  allItems,
  readOnly = false,
  mode,
  setModalMode,
  onSoftSave,
}: BuildModalProps) {
  const defaultBuild: IBuild = {
    mainHand: "",
    offHand: "",
    head: "",
    armor: "",
    shoes: "",
    cape: "",
    mount: "",
    food: "",
    potion: "",
  };

  const [tempBuild, setTempBuild] = useState<IBuild>(defaultBuild);
  const [activeSlot, setActiveSlot] = useState<keyof IBuild>("mainHand");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState<number>(8);
  const [selectedEnchant, setSelectedEnchant] = useState<number>(0);

  const isSpecialSlot = ["mount", "food", "potion"].includes(activeSlot);

  // --- KRİTİK: MOD VEYA SLOT DEĞİŞİNCE VERİYİ YÜKLE ---
  useEffect(() => {
    if (!isOpen) return;

    const targetBuildData = mode === "swap" ? slot?.swapBuild : slot?.build;
    const targetBuild = targetBuildData
      ? { ...defaultBuild, ...targetBuildData }
      : defaultBuild;

    // Sonsuz döngü koruması
    if (JSON.stringify(tempBuild) !== JSON.stringify(targetBuild)) {
      setTempBuild({ ...targetBuild });
      setSearchTerm("");
      setActiveSlot("mainHand");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, slot?.id, mode]);

  // --- SOFT SAVE: Mod Değişirken Kaydet Ama Modalı Kapatma ---
  const handleModeChange = (newMode: "main" | "swap") => {
    if (mode === newMode) return;
    onSoftSave(tempBuild); // Seçimleri arka plana gönderir ama modalı kapatmaz
    setModalMode(newMode);
  };

  const processedItems = useMemo(() => {
    const rawCollection = allItems[activeSlot as keyof ICategorizedItems] || [];
    if (!isOpen) return {};

    const filtered = searchTerm
      ? rawCollection.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : rawCollection;

    const uniqueItemsMap = new Map<string, IItem>();
    filtered.forEach((item) => {
      const baseId = item.id.split("@")[0].replace(/^T\d+_/, "");
      const key = `${baseId}|${item.subCategory}`;
      if (!uniqueItemsMap.has(key)) {
        uniqueItemsMap.set(key, {
          ...item,
          validTiers: item.validTiers?.length ? item.validTiers : [item.tier],
        });
      } else {
        const existing = uniqueItemsMap.get(key)!;
        existing.validTiers = Array.from(
          new Set([
            ...(existing.validTiers || []),
            ...(item.validTiers || [item.tier]),
          ])
        ).sort((a, b) => a - b);
        existing.maxEnchantment = Math.max(
          existing.maxEnchantment || 0,
          item.maxEnchantment || 0
        );
        existing.minEnchantment = Math.min(
          existing.minEnchantment || 0,
          item.minEnchantment || 0
        );
        if (item.tier > existing.tier) {
          existing.id = item.id;
          existing.tier = item.tier;
        }
      }
    });

    let finalItems = Array.from(uniqueItemsMap.values());
    if (!isSpecialSlot)
      finalItems = finalItems.filter((item) =>
        item.validTiers?.includes(selectedTier)
      );

    const groups: Record<string, IItem[]> = {};
    finalItems.forEach((item) => {
      const g = item.subCategory || "Other";
      if (!groups[g]) groups[g] = [];
      groups[g].push(item);
    });

    return Object.keys(groups)
      .sort()
      .reduce((obj, key) => {
        obj[key] = groups[key];
        return obj;
      }, {} as Record<string, IItem[]>);
  }, [allItems, activeSlot, searchTerm, selectedTier, isSpecialSlot, isOpen]);

  const isTwoHanded = tempBuild.mainHand?.includes("2H");

  const calculateItemProps = (item: IItem) => {
    const targetTier = isSpecialSlot
      ? item.validTiers?.length
        ? Math.max(...item.validTiers)
        : item.tier
      : item.validTiers?.includes(selectedTier)
      ? selectedTier
      : Math.max(...(item.validTiers || [item.tier]));
    const maxEnch = ["food", "potion"].includes(item.category)
      ? 3
      : item.category === "mount"
      ? 0
      : 4;
    const targetEnchant = Math.min(
      Math.max(selectedEnchant, item.minEnchantment || 0),
      maxEnch
    );
    let fullId = constructItemId(item, targetTier, targetEnchant);
    if (targetEnchant === 0 && fullId?.includes("@"))
      fullId = fullId.split("@")[0];
    return {
      fullId: fullId || item.id,
      displayTier: targetTier,
      displayEnchant: targetEnchant,
    };
  };

  const handleSave = () => {
    const finalBuild = { ...tempBuild };
    if (isTwoHanded) finalBuild.offHand = "";
    onSave(finalBuild); // Bu ana kayıt fonksiyonudur, modalı kapatır
  };

  const clearSlot = (_e: React.MouseEvent, key: keyof IBuild) => {
    _e.stopPropagation();
    setTempBuild({ ...tempBuild, [key]: "" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md p-2 lg:p-8">
      <div className="bg-slate-900 w-full max-w-6xl h-[90vh] rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h2 className="text-xl font-black text-yellow-500 uppercase italic tracking-tighter">
              {readOnly ? "View" : "Edit"} Build - {slot?.role}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full transition text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* MODAL HIZLI GEÇİŞ TOGGLE - FIX: handleModeChange kullanıldı */}
        {!readOnly && (
          <div className="flex justify-center p-3 bg-slate-950 border-b border-slate-800">
            <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-full max-w-sm shadow-inner">
              <button
                onClick={() => handleModeChange("main")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${
                  mode === "main"
                    ? "text-white bg-blue-600 shadow-lg"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Sword size={14} /> Main Loadout
              </button>
              <button
                onClick={() => handleModeChange("swap")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${
                  mode === "swap"
                    ? "text-black bg-yellow-500 shadow-lg"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <RefreshCw size={14} /> Tactical Swap
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
          {/* LEFT: SLOTS */}
          <div className="w-full lg:w-72 bg-slate-950/50 border-r border-slate-800 p-3 overflow-y-auto shrink-0 custom-scrollbar">
            <div className="space-y-1.5">
              {SLOT_CONFIG.map((conf) => {
                const isActive = activeSlot === conf.key;
                const displayId = tempBuild[conf.key];
                const isDisabled = conf.key === "offHand" && isTwoHanded;
                return (
                  <div
                    key={conf.key}
                    onClick={() => !isDisabled && setActiveSlot(conf.key)}
                    className={`relative flex items-center gap-2.5 p-2 rounded-xl border transition cursor-pointer select-none ${
                      isDisabled ? "opacity-20 cursor-not-allowed" : ""
                    } ${
                      isActive
                        ? "bg-slate-800 border-yellow-500/50 shadow-lg shadow-yellow-500/5"
                        : "bg-slate-900 border-slate-800 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="w-12 h-12 rounded bg-black border border-slate-700 flex items-center justify-center relative overflow-hidden shrink-0">
                      {displayId ? (
                        <>
                          <ItemLoader
                            src={`https://render.albiononline.com/v1/item/${displayId}?quality=4`}
                            alt={conf.label}
                            size={44}
                            className="p-1"
                          />
                          {!readOnly && (
                            <div
                              onClick={(e) => clearSlot(e, conf.key)}
                              className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </div>
                          )}
                        </>
                      ) : (
                        <conf.icon className="text-slate-700" size={20} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] text-slate-500 font-black uppercase leading-none mb-1">
                        {conf.label}
                      </div>
                      <div className="text-[11px] text-slate-200 truncate font-bold uppercase tracking-tight italic">
                        {displayId
                          ? Object.values(allItems)
                              .flat()
                              .find((i) =>
                                displayId.includes(
                                  i.id.split("@")[0].replace(/^T\d+_/, "")
                                )
                              )?.name || "Selected"
                          : "Empty"}
                      </div>
                    </div>
                    {isActive && (
                      <ChevronRight className="text-yellow-500" size={16} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-slate-900 relative">
            {!readOnly && (
              <div className="p-4 border-b border-slate-800 flex flex-col gap-4 bg-slate-900/50">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-3 text-slate-500"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder={`Search ${activeSlot}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 p-2.5 pl-10 rounded-xl text-slate-200 focus:border-yellow-500 outline-none uppercase text-xs font-black italic tracking-widest"
                  />
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  {!isSpecialSlot && (
                    <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-black text-slate-500 px-2 uppercase italic">
                        Tier
                      </span>
                      <div className="flex">
                        {[4, 5, 6, 7, 8].map((t) => (
                          <button
                            key={t}
                            onClick={() => setSelectedTier(t)}
                            className={`w-8 h-7 text-xs font-black rounded transition ${
                              selectedTier === t
                                ? "bg-slate-700 text-white shadow"
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeSlot !== "mount" && (
                    <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-black text-slate-500 px-2 uppercase italic">
                        Ench
                      </span>
                      <div className="flex gap-1">
                        {(["food", "potion"].includes(activeSlot)
                          ? [0, 1, 2, 3]
                          : [0, 1, 2, 3, 4]
                        ).map((e) => (
                          <button
                            key={e}
                            onClick={() => setSelectedEnchant(e)}
                            className={`w-7 h-7 text-xs font-black rounded transition ${
                              selectedEnchant === e
                                ? "brightness-125 border border-white/20"
                                : "text-slate-500"
                            }`}
                            style={{
                              backgroundColor:
                                selectedEnchant === e
                                  ? [
                                      "#475569",
                                      "#166534",
                                      "#1e40af",
                                      "#6b21a8",
                                      "#ca8a04",
                                    ][e]
                                  : "#0f172a",
                            }}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-900">
              {Object.entries(processedItems).map(([category, items]) => (
                <div key={category} className="mb-6">
                  <h4 className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] mb-3 border-b border-slate-800/50 pb-1 sticky top-0 bg-slate-900 z-10 italic">
                    {category}
                  </h4>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {items.map((item) => {
                      const { fullId, displayTier, displayEnchant } =
                        calculateItemProps(item);
                      const isSelected = tempBuild[activeSlot] === fullId;
                      return (
                        <button
                          key={`${item.id}-${displayTier}-${displayEnchant}`}
                          onClick={() =>
                            !readOnly &&
                            setTempBuild({ ...tempBuild, [activeSlot]: fullId })
                          }
                          className={`relative aspect-square bg-slate-950 rounded-xl border-2 transition overflow-hidden ${
                            isSelected
                              ? "border-yellow-500 ring-4 ring-yellow-500/10 shadow-lg shadow-yellow-500/5"
                              : "border-slate-800 hover:border-slate-600 hover:bg-slate-800"
                          }`}
                        >
                          <ItemLoader
                            src={`https://render.albiononline.com/v1/item/${fullId}?quality=4`}
                            alt={item.name}
                            size={80}
                          />
                          <div className="absolute bottom-1 right-1 text-[8px] text-slate-400 font-black bg-black/80 px-1 rounded-sm border border-slate-800">
                            T{displayTier}
                            {displayEnchant ? `.${displayEnchant}` : ""}
                          </div>
                          {isSelected && (
                            <div className="absolute inset-0 bg-yellow-500/10 flex items-center justify-center animate-in fade-in duration-300">
                              <div className="bg-yellow-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded shadow-xl tracking-tighter">
                                EQUIPPED
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center shadow-2xl">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
            {isTwoHanded && activeSlot === "offHand"
              ? "⚠️ Secondary Weapon Blocked"
              : `Configure Items for ${mode} loadout`}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-800 transition uppercase text-xs tracking-widest italic"
            >
              Cancel
            </button>
            {!readOnly && (
              <button
                onClick={handleSave}
                className="px-8 py-2.5 rounded-xl font-black bg-yellow-600 hover:bg-yellow-500 text-black shadow-lg shadow-yellow-600/20 transition uppercase text-xs italic tracking-[0.2em] active:scale-95"
              >
                Save {mode}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
