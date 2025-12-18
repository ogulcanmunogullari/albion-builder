"use client";

import React, { useState, useEffect } from "react";
import {
  Copy,
  Trash2,
  Plus,
  Edit,
  X,
  Search,
  Eye,
  Share2,
  Link as LinkIcon,
  Lock,
  Unlock,
  MapPin,
  Repeat,
} from "lucide-react";
import { IItem, ISlot, IBuild, ICategorizedItems } from "./types";

// --- HELPER ---
const constructItemId = (
  baseItem: IItem | undefined,
  tier: number,
  enchant: number
): string | null => {
  if (!baseItem || !baseItem.id) return null;
  const rawId = baseItem.id;
  const parts = rawId.split("_");
  const baseIdSuffix = parts.slice(1).join("_").split("@")[0];
  let newId = `T${tier}_${baseIdSuffix}`;
  if (enchant > 0) newId += `@${enchant}`;
  return newId;
};

// --- BUILD MODAL ---
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

const BuildModal = ({
  isOpen,
  onClose,
  slot,
  onSave,
  allItems,
  readOnly = false,
}: BuildModalProps) => {
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

  // useEffect sadece modal AÇIKSA çalışmalı (Performans ve döngü fix)
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
  }, [isOpen, slot, allItems]); // Dependency array düzeltildi

  if (!isOpen) return null;

  const isTwoHanded = tempBuild.mainHand && tempBuild.mainHand.includes("2H");

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
};

// --- MAIN COMPONENT ---
interface HomeClientProps {
  items: ICategorizedItems;
  initialData?: any;
}

export default function HomeClient({ items, initialData }: HomeClientProps) {
  // HOOK SIRALAMASI DÜZELTİLDİ: Hepsi en üstte
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [rallyPoint, setRallyPoint] = useState(initialData?.rallyPoint || "");
  const [swap, setSwap] = useState(initialData?.swap || "");
  const [composition, setComposition] = useState<ISlot[]>(
    initialData?.slots || []
  );

  const [passwordInput, setPasswordInput] = useState("");
  const [isLocked, setIsLocked] = useState(!!initialData?.hasPassword);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
  const [isReadOnlyModal, setIsReadOnlyModal] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && initialData._id) {
      const link = `${window.location.origin}/comp/${initialData._id}`;
      setShareLink(link);
    }
  }, [initialData]);

  // Loading kontrolü Hook'lardan SONRA yapılmalı
  if (!items || !items.mainHand)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        Loading...
      </div>
    );

  const saveToCloud = async () => {
    if (!title) return alert("Title is required!");
    if (composition.length === 0) return alert("List is empty!");

    try {
      const res = await fetch("/api/comps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          rallyPoint,
          swap,
          password: passwordInput,
          slots: composition,
        }),
      });
      const data = await res.json();

      if (data.success) {
        const link = `${window.location.origin}/comp/${data.id}`;
        setShareLink(link);

        await navigator.clipboard.writeText(link);
        alert("✅ Saved! Link copied to clipboard. Redirecting...");
        window.location.href = `/comp/${data.id}`;
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Connection error!");
    }
  };

  const handleUnlock = async () => {
    try {
      const res = await fetch("/api/comps/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: initialData._id, password: unlockPassword }),
      });
      const result = await res.json();

      if (result.success) {
        setIsLocked(false);
        setShowUnlockModal(false);
        alert("Unlocked! You can now edit.");
      } else {
        alert("Incorrect Password!");
      }
    } catch (error) {
      alert("Verification error");
    }
  };

  const handleEditClick = (index: number) => {
    if (isLocked) {
      setShowUnlockModal(true);
    } else {
      setEditingSlotIndex(index);
      setIsReadOnlyModal(false);
      setIsModalOpen(true);
    }
  };

  const ROLES = [
    "Caller",
    "Tank",
    "Defensive Tank",
    "Aggressive Tank",
    "Support",
    "Defensive Support",
    "Aggressive Support",
    "Healer",
    "Main Healer",
    "Frontline Healer",
    "Backline Healer",
    "Melee DPS",
    "Ranged DPS",
    "Battle Mount",
  ];

  const addSlot = () => {
    setComposition([
      ...composition,
      {
        id: Date.now(),
        role: "Tank",
        weaponId: "",
        build: {
          mainHand: "",
          offHand: "",
          head: "",
          armor: "",
          shoes: "",
          cape: "",
          mount: "",
          food: "",
          potion: "",
        },
      },
    ]);
  };

  const updateSlotBuild = (finalBuildData: IBuild) => {
    if (editingSlotIndex !== null) {
      const newComp = [...composition];
      newComp[editingSlotIndex].build = finalBuildData;
      newComp[editingSlotIndex].weaponId = finalBuildData.mainHand;
      setComposition(newComp);
      setIsModalOpen(false);
      setEditingSlotIndex(null);
    }
  };

  const getDisplayName = (fullId: string) => {
    if (!fullId) return "";
    const parts = fullId.split("_");
    const baseSuffix = parts.slice(1).join("_").split("@")[0];
    const flattenItems = [
      ...(items.mainHand || []),
      ...(items.offHand || []),
      ...(items.head || []),
      ...(items.armor || []),
      ...(items.shoes || []),
      ...(items.cape || []),
      ...(items.mount || []),
      ...(items.food || []),
      ...(items.potion || []),
    ];
    const found = flattenItems.find((i) => i.id.includes(baseSuffix));
    return found ? found.name : fullId;
  };

  const generateDiscordText = () => {
    let text = `**${title.toUpperCase()}**\n\n`;
    if (description) text += `*${description}*\n\n`;
    if (rallyPoint) text += `📍 **Rally:** ${rallyPoint}\n\n`;
    if (swap) text += `🔄 **Swap:** ${swap}\n\n`;
    if (shareLink) text += `🔗 **Builds Link:** <${shareLink}>\n\n`;
    composition.forEach((slot, index) => {
      const weaponName = getDisplayName(slot.weaponId);
      text += `${index + 1}.**${
        slot.role
      }** - ${weaponName} - @Player Discord Nickname\n\n`;
    });
    return text;
  };

  const SmallItemIcon = ({ id }: { id: string }) => {
    if (!id) return null;
    return (
      <div className="w-10 h-10 bg-slate-950 rounded border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden relative group">
        <img
          src={`https://render.albiononline.com/v1/item/${id}?quality=4`}
          className="w-full h-full object-contain"
          onError={(e) => (e.currentTarget.style.display = "none")}
          alt="item"
        />
        <div className="absolute bottom-full mb-1 hidden group-hover:block bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 border border-slate-600">
          {getDisplayName(id)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-700">
              WAR MAKER
            </h1>
          </div>

          <div className="flex flex-col md:flex-row gap-2 items-end md:items-center">
            {!initialData && (
              <input
                type="text"
                placeholder="Caller Password (Optional)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="bg-slate-950 border border-slate-700 p-2 rounded text-sm text-slate-300 outline-none focus:border-blue-500 w-48"
              />
            )}

            {isLocked && initialData && (
              <div className="flex items-center gap-2 text-red-500 bg-red-900/20 px-3 py-2 rounded border border-red-900/50">
                <Lock size={16} />{" "}
                <span className="text-sm font-bold">LOCKED (Read-Only)</span>
              </div>
            )}
            {!isLocked && initialData && (
              <div className="flex items-center gap-2 text-green-500 bg-green-900/20 px-3 py-2 rounded border border-green-900/50">
                <Unlock size={16} />{" "}
                <span className="text-sm font-bold">EDITING UNLOCKED</span>
              </div>
            )}

            <button
              onClick={saveToCloud}
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-bold flex items-center gap-2 transition shadow-lg shadow-blue-900/20 whitespace-nowrap"
            >
              <Share2 size={18} /> Save & Share
            </button>
          </div>
        </div>

        {shareLink && (
          <div className="bg-green-900/30 border border-green-700 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3 text-green-400">
              <LinkIcon />
              <span className="font-bold">Comp Saved! Link:</span>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                readOnly
                value={shareLink}
                className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm w-full md:w-96 text-slate-300"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                  alert("Copied!");
                }}
                className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded font-bold text-sm"
              >
                Copy Link
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateDiscordText());
                  alert("Discord text copied!");
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded font-bold text-sm flex gap-2 items-center"
              >
                <Copy size={16} /> Copy Discord Text
              </button>
            </div>
          </div>
        )}

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
          <input
            value={title}
            onChange={(e) => !isLocked && setTitle(e.target.value)}
            readOnly={isLocked}
            className={`w-full bg-transparent text-3xl font-bold border-b focus:border-yellow-500 outline-none placeholder-slate-700 ${
              isLocked
                ? "border-transparent text-slate-400"
                : "border-slate-700"
            }`}
            placeholder="Composition Title"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea
              value={description}
              onChange={(e) => !isLocked && setDescription(e.target.value)}
              readOnly={isLocked}
              className={`w-full bg-slate-950 p-3 rounded border h-24 outline-none focus:border-yellow-500 col-span-1 md:col-span-2 ${
                isLocked
                  ? "border-slate-800 text-slate-500"
                  : "border-slate-800"
              }`}
              placeholder="General Description..."
            />

            <div className="relative">
              <MapPin
                className="absolute left-3 top-3 text-slate-500"
                size={18}
              />
              <input
                value={rallyPoint}
                onChange={(e) => !isLocked && setRallyPoint(e.target.value)}
                readOnly={isLocked}
                className={`w-full bg-slate-950 p-2 pl-10 rounded border outline-none focus:border-yellow-500 ${
                  isLocked
                    ? "border-slate-800 text-slate-500"
                    : "border-slate-800"
                }`}
                placeholder="Rally Point (e.g. Martlock Portal)"
              />
            </div>

            <div className="relative">
              <Repeat
                className="absolute left-3 top-3 text-slate-500"
                size={18}
              />
              <input
                value={swap}
                onChange={(e) => !isLocked && setSwap(e.target.value)}
                readOnly={isLocked}
                className={`w-full bg-slate-950 p-2 pl-10 rounded border outline-none focus:border-yellow-500 ${
                  isLocked
                    ? "border-slate-800 text-slate-500"
                    : "border-slate-800"
                }`}
                placeholder="Swap Instructions (e.g. 5 Calming, 3 Giga...)"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-800/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-300">Player List</h3>
            {!isLocked && (
              <button
                onClick={() => setComposition([])}
                className="text-red-400 text-sm flex gap-1 items-center hover:text-red-300 transition"
              >
                <Trash2 size={14} /> Clear
              </button>
            )}
          </div>
          <div className="divide-y divide-slate-800">
            {composition.map((slot, index) => (
              <div
                key={slot.id}
                className="flex flex-col lg:flex-row items-center gap-4 p-4 hover:bg-slate-800/40 transition group"
              >
                <span className="font-mono text-slate-500 font-bold w-6 text-center">
                  {index + 1}
                </span>
                <select
                  value={slot.role}
                  disabled={isLocked}
                  onChange={(e) => {
                    const n = [...composition];
                    n[index].role = e.target.value;
                    setComposition(n);
                  }}
                  className={`bg-slate-950 border border-slate-700 rounded p-2 text-sm font-bold text-blue-400 w-full lg:w-40 focus:border-blue-500 outline-none ${
                    isLocked ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <div className="flex gap-1 items-center justify-center lg:justify-start min-w-[250px] flex-wrap">
                  <SmallItemIcon id={slot.weaponId} />
                  <SmallItemIcon id={slot.build.offHand} />
                  <SmallItemIcon id={slot.build.head} />
                  <SmallItemIcon id={slot.build.armor} />
                  <SmallItemIcon id={slot.build.shoes} />
                  <SmallItemIcon id={slot.build.cape} />
                  {(slot.build.mount ||
                    slot.build.food ||
                    slot.build.potion) && (
                    <div className="w-px h-8 bg-slate-700 mx-1"></div>
                  )}
                  <SmallItemIcon id={slot.build.mount} />
                  <SmallItemIcon id={slot.build.food} />
                  <SmallItemIcon id={slot.build.potion} />
                </div>
                <div className="flex-1 w-full text-center lg:text-left">
                  <div className="font-bold text-slate-200 text-lg">
                    {getDisplayName(slot.weaponId)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {slot.build.armor ? getDisplayName(slot.build.armor) : ""}
                  </div>
                </div>
                <div className="flex gap-2 w-full lg:w-auto justify-end">
                  <button
                    onClick={() => {
                      setEditingSlotIndex(index);
                      setIsReadOnlyModal(true);
                      setIsModalOpen(true);
                    }}
                    className="bg-slate-800 text-slate-400 p-2 rounded hover:bg-slate-700 hover:text-white transition"
                    title="View"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    onClick={() => handleEditClick(index)}
                    className="bg-yellow-600/10 text-yellow-500 px-4 py-2 rounded border border-yellow-600/30 hover:bg-yellow-600 hover:text-white transition flex gap-2 items-center text-sm font-medium"
                  >
                    {isLocked ? <Lock size={16} /> : <Edit size={16} />}{" "}
                    {isLocked ? "Unlock" : "Edit"}
                  </button>

                  {!isLocked && (
                    <button
                      onClick={() =>
                        setComposition(
                          composition.filter((_, i) => i !== index)
                        )
                      }
                      className="text-slate-600 hover:text-red-500 p-2 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {!isLocked && (
            <button
              onClick={addSlot}
              className="w-full py-4 bg-slate-800/30 hover:bg-slate-800 flex justify-center items-center gap-2 text-slate-400 hover:text-white transition border-t border-slate-800 font-medium"
            >
              <Plus size={20} /> Add New Player
            </button>
          )}
        </div>

        <BuildModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSlotIndex(null);
          }}
          slot={
            editingSlotIndex !== null ? composition[editingSlotIndex] : null
          }
          onSave={updateSlotBuild}
          allItems={items}
          readOnly={isReadOnlyModal}
        />

        {showUnlockModal && (
          <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60] backdrop-blur-sm">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 w-full max-w-sm text-center">
              <div className="mx-auto bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-red-500">
                <Lock size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Comp Locked</h3>
              <p className="text-slate-400 mb-4 text-sm">
                Enter caller password to edit.
              </p>

              <input
                type="password"
                placeholder="Password..."
                className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-white text-center text-lg mb-4 outline-none focus:border-yellow-500"
                value={unlockPassword}
                onChange={(e) => setUnlockPassword(e.target.value)}
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowUnlockModal(false)}
                  className="flex-1 py-3 text-slate-400 hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnlock}
                  className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded"
                >
                  UNLOCK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
