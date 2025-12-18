"use client";

import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";

import { ISlot, IBuild, ICategorizedItems, IItem } from "../types";
import { constructItemId } from "../utils/helpers";

interface BuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: ISlot | null;
  onSave: (build: IBuild) => void;
  allItems: ICategorizedItems;
  readOnly?: boolean;
}

type SelectionState = {
  [key in keyof IBuild]?: { tier: number; enchant: number };
};

export default function BuildModal({
  isOpen,
  onClose,
  slot,
  onSave,
  allItems,
  readOnly = false,
}: BuildModalProps) {
  const [tempBuild, setTempBuild] = useState<IBuild>({
    mainHand: "",
    offHand: "",
    head: "",
    armor: "",
    shoes: "",
    cape: "",
    mount: "",
    food: "",
    potion: "",
  });

  const [selection, setSelection] = useState<SelectionState>({});
  const [searchTerm, setSearchTerm] = useState("");

  // Modal açıldığında veya slot değiştiğinde verileri işle
  useEffect(() => {
    if (isOpen && slot?.build) {
      const newTempBuild: IBuild = {
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
      const newSelection: SelectionState = {};

      (Object.keys(slot.build) as Array<keyof IBuild>).forEach((key) => {
        const savedId = slot.build[key];
        if (!savedId) return;

        const tierMatch = savedId.match(/^T(\d+)_/);
        const tier = tierMatch ? parseInt(tierMatch[1]) : 8;

        const enchantParts = savedId.split("@");
        const enchant = enchantParts.length > 1 ? parseInt(enchantParts[1]) : 0;

        const parts = savedId.split("_");
        const baseSuffix = parts.slice(1).join("_").split("@")[0];

        const collection = (allItems as any)[key] || [];
        const foundBaseItem = collection.find(
          (i: IItem) =>
            i.id.includes(`_${baseSuffix}`) || i.id.endsWith(baseSuffix)
        );

        if (foundBaseItem) {
          newTempBuild[key] = foundBaseItem.id;
          newSelection[key] = { tier, enchant };
        } else {
          newTempBuild[key] = savedId;
          newSelection[key] = { tier, enchant };
        }
      });
      setTempBuild(newTempBuild);
      setSelection(newSelection);
      setSearchTerm("");
    }
  }, [isOpen, slot, allItems]);

  if (!isOpen) return null;

  const isTwoHanded = tempBuild.mainHand && tempBuild.mainHand.includes("2H");

  const handleSave = () => {
    const finalBuild: Partial<IBuild> = {};
    const flattenItems = [
      ...(allItems.mainHand || []),
      ...(allItems.offHand || []),
      ...(allItems.head || []),
      ...(allItems.armor || []),
      ...(allItems.shoes || []),
      ...(allItems.cape || []),
      ...(allItems.mount || []),
      ...(allItems.food || []),
      ...(allItems.potion || []),
    ];

    (Object.keys(tempBuild) as Array<keyof IBuild>).forEach((key) => {
      if (key === "offHand" && isTwoHanded) {
        finalBuild[key] = "";
        return;
      }
      if (tempBuild[key]) {
        const baseItemObj = flattenItems.find((i) => i.id === tempBuild[key]);
        const s = selection[key] || { tier: 8, enchant: 0 };
        finalBuild[key] = constructItemId(baseItemObj, s.tier, s.enchant) || "";
      } else {
        finalBuild[key] = "";
      }
    });
    onSave(finalBuild as IBuild);
  };

  const renderSelect = (
    label: string,
    type: keyof IBuild,
    collection: IItem[] = []
  ) => {
    const safeCollection = collection || [];
    const filteredCollection = safeCollection.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentSelection = selection[type] || { tier: 8, enchant: 0 };
    const currentBaseItemObj = safeCollection.find(
      (i) => i.id === tempBuild[type]
    );

    const availableTiers =
      currentBaseItemObj?.validTiers && currentBaseItemObj.validTiers.length > 0
        ? currentBaseItemObj.validTiers
        : [2, 3, 4, 5, 6, 7, 8];

    const displayId = currentBaseItemObj
      ? constructItemId(
          currentBaseItemObj,
          currentSelection.tier,
          currentSelection.enchant
        )
      : null;

    return (
      <div
        className={`mb-3 p-2 rounded border ${
          readOnly
            ? "bg-slate-800/20 border-slate-800"
            : "bg-slate-700/40 border-slate-600"
        }`}
      >
        <label className="block text-yellow-500 text-xs font-bold mb-1">
          {label}
        </label>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="relative w-12 h-12 bg-black/40 rounded border border-slate-600 flex items-center justify-center shrink-0">
              {displayId ? (
                <>
                  <img
                    src={`https://render.albiononline.com/v1/item/${displayId}?quality=4`}
                    className="w-full h-full object-contain p-0.5"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                    alt={label}
                  />
                  <span className="absolute bottom-0 right-0 bg-black text-white text-[9px] px-1 font-bold leading-none">
                    {currentSelection.tier}.{currentSelection.enchant}
                  </span>
                </>
              ) : (
                <span className="text-slate-600 text-[10px]">None</span>
              )}
            </div>

            <select
              value={tempBuild[type] || ""}
              disabled={readOnly}
              onChange={(e) => {
                const newItemId = e.target.value;
                const newItem = safeCollection.find((i) => i.id === newItemId);
                let newTier = selection[type]?.tier || 8;
                if (
                  newItem &&
                  newItem.validTiers &&
                  newItem.validTiers.length > 0
                ) {
                  if (!newItem.validTiers.includes(newTier))
                    newTier = newItem.validTiers[newItem.validTiers.length - 1];
                }
                setTempBuild({ ...tempBuild, [type]: newItemId });
                setSelection({
                  ...selection,
                  [type]: {
                    ...(selection[type] || { enchant: 0 }),
                    tier: newTier,
                  } as any,
                });
              }}
              className={`flex-1 bg-slate-800 border border-slate-600 text-white p-1.5 text-sm rounded outline-none w-full ${
                readOnly ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <option value="">
                {readOnly && !tempBuild[type] ? "Empty" : `-- Select --`}
              </option>
              {filteredCollection.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {tempBuild[type] && !readOnly && (
            <div className="flex gap-2 flex-wrap">
              <div className="flex flex-col">
                <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">
                  Tier
                </span>
                <div className="flex flex-wrap bg-slate-800 rounded border border-slate-600 overflow-hidden">
                  {[2, 3, 4, 5, 6, 7, 8].map((t) => {
                    const isAvailable = availableTiers.includes(t);
                    return (
                      <button
                        key={t}
                        disabled={!isAvailable}
                        onClick={() =>
                          isAvailable &&
                          setSelection({
                            ...selection,
                            [type]: {
                              ...(selection[type] || { enchant: 0 }),
                              tier: t,
                            } as any,
                          })
                        }
                        className={`px-2 py-0.5 text-[10px] font-bold transition border-r border-slate-700 last:border-0 ${
                          !isAvailable
                            ? "bg-slate-900 text-slate-700 cursor-not-allowed"
                            : selection[type]?.tier === t
                            ? "bg-yellow-600 text-black"
                            : "text-slate-400 hover:bg-slate-700 hover:text-white"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {type !== "mount" && (
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">
                    Enchant
                  </span>
                  <div className="flex flex-wrap bg-slate-800 rounded border border-slate-600 overflow-hidden">
                    {[0, 1, 2, 3, 4].map((e) => (
                      <button
                        key={e}
                        onClick={() =>
                          setSelection({
                            ...selection,
                            [type]: {
                              ...(selection[type] || { tier: 8 }),
                              enchant: e,
                            } as any,
                          })
                        }
                        className={`px-2 py-0.5 text-[10px] font-bold transition border-r border-slate-700 last:border-0 ${
                          selection[type]?.enchant === e
                            ? "brightness-110 shadow-inner"
                            : "text-slate-400 hover:bg-slate-700"
                        }`}
                        style={
                          selection[type]?.enchant === e
                            ? {
                                backgroundColor: [
                                  "#64748b",
                                  "#16a34a",
                                  "#2563eb",
                                  "#9333ea",
                                  "#facc15",
                                ][e],
                                color: e === 4 ? "black" : "white",
                              }
                            : {}
                        }
                      >
                        .{e}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md p-2 overflow-hidden">
      <div className="bg-slate-900 p-3 rounded-xl w-full max-w-7xl border border-slate-700 shadow-2xl relative max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-2 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-yellow-500">
              {readOnly ? "View:" : "Edit:"} {slot?.role}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-slate-800 rounded hover:bg-red-600 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {!readOnly && (
          <div className="mb-2 relative shrink-0">
            <Search
              className="absolute left-3 top-2.5 text-slate-500"
              size={14}
            />
            <input
              type="text"
              placeholder="Search Items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 p-1.5 pl-8 rounded text-sm text-slate-200 focus:border-yellow-500 outline-none"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 overflow-y-auto pr-1 custom-scrollbar grow">
          <div className="space-y-2 bg-slate-800/20 p-2 rounded h-fit">
            <h3 className="text-slate-400 font-bold mb-1 text-xs uppercase border-b border-slate-700 pb-1">
              ⚔️ Weapons & Cape
            </h3>
            {renderSelect("Main Hand", "mainHand", allItems.mainHand)}
            {!isTwoHanded &&
              renderSelect("Off Hand", "offHand", allItems.offHand)}
            {renderSelect("Cape", "cape", allItems.cape)}
          </div>
          <div className="space-y-2 bg-slate-800/20 p-2 rounded h-fit">
            <h3 className="text-slate-400 font-bold mb-1 text-xs uppercase border-b border-slate-700 pb-1">
              🛡️ Armor Set
            </h3>
            {renderSelect("Head", "head", allItems.head)}
            {renderSelect("Armor", "armor", allItems.armor)}
            {renderSelect("Shoes", "shoes", allItems.shoes)}
          </div>
          <div className="space-y-2 bg-slate-800/20 p-2 rounded h-fit">
            <h3 className="text-slate-400 font-bold mb-1 text-xs uppercase border-b border-slate-700 pb-1">
              🐎 Inventory & Mount
            </h3>
            {renderSelect("Mount", "mount", allItems.mount)}
            {renderSelect("Food", "food", allItems.food)}
            {renderSelect("Potion", "potion", allItems.potion)}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-2 border-t border-slate-800 pt-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
          >
            Close
          </button>
          {!readOnly && (
            <button
              onClick={handleSave}
              className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-8 py-2 text-sm rounded shadow-lg transition active:scale-95"
            >
              SAVE
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
