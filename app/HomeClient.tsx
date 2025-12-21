// utils/HomeClient.tsx (veya dosyan neredeyse oraya yapıştır)
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Trash2,
  Plus,
  Edit,
  Save,
  Lock,
  Unlock,
  MapPin,
  Repeat,
  Coins,
  Link as LinkIcon,
  Eye,
  CheckSquare,
  Square,
} from "lucide-react";

// --- YENİ IMPORTLAR (Path Alias kullanarak) ---
import { IItem, ISlot, IBuild, ICategorizedItems, IComp } from "@/types";
import { getDisplayName } from "@/utils/helpers"; // Helper'ları buradan çekiyoruz
import BuildModal from "@/components/BuildModal"; // Modal'ı buradan çekiyoruz
import Image from "next/image";

// --- ANA COMPONENT ---
interface HomeClientProps {
  items: ICategorizedItems;
  initialData?: IComp;
}

export default function HomeClient({ items, initialData }: HomeClientProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [rallyPoint, setRallyPoint] = useState(initialData?.rallyPoint || "");
  const [swap, setSwap] = useState(initialData?.swap || "");
  const [composition, setComposition] = useState<ISlot[]>(
    initialData?.slots || []
  );

  const [isLocked, setIsLocked] = useState(!!initialData?.hasPassword);
  const [unlockPassword, setUnlockPassword] = useState("");

  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [removePassword, setRemovePassword] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
  const [isReadOnlyModal, setIsReadOnlyModal] = useState(false);

  const showToolbar = isLocked || (!isLocked && initialData?._id);

  // Loading durumu
  if (!items || !items.mainHand)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        Loading...
      </div>
    );

  // Tüm itemleri tek listede birleştir (Display Name bulmak için)
  const flattenItems: IItem[] = [
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

  const handleSaveClick = () => {
    if (!title) return alert("Title is required!");
    if (composition.length === 0) return alert("List is empty!");
    setShowPasswordModal(true);
    setNewPassword("");
    setRemovePassword(false);
  };

  const confirmSave = async () => {
    try {
      const isUpdate = !!initialData?._id;
      const method = isUpdate ? "PUT" : "POST";

      const authPassword = unlockPassword;
      let nextPassword = undefined;

      if (removePassword) {
        nextPassword = "";
      } else if (newPassword) {
        nextPassword = newPassword;
      } else {
        nextPassword = undefined;
      }

      const res = await fetch("/api/comps", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initialData?._id,
          title,
          description,
          rallyPoint,
          swap,
          password: authPassword,
          nextPassword: nextPassword,
          slots: composition,
        }),
      });
      const data = await res.json();

      if (data.success) {
        if (removePassword) {
          setUnlockPassword("");
          setIsLocked(false);
        } else {
          if (newPassword) setUnlockPassword(newPassword);
          setIsLocked(true);
        }

        if (isUpdate) {
          alert("✅ Changes Saved!");
          setShowPasswordModal(false);
          router.refresh();
        } else {
          // Yeni oluşturulduysa yönlendir
          router.push(`/comp/${data.id}`);
          alert("✅ Comp Created! Link is ready.");
          setShowPasswordModal(false);
        }
      } else {
        alert("Error: " + data.error);
      }
    } catch (error: unknown) {
      console.error(error);
      alert("Connection error!");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comp permanently?"))
      return;
    const pwd = newPassword || unlockPassword;
    try {
      const res = await fetch("/api/comps/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: initialData?._id, password: pwd }),
      });
      if (res.ok) {
        alert("Deleted successfully.");
        router.push("/");
      } else {
        const d = await res.json();
        alert("Error: " + d.error);
      }
    } catch (error: unknown) {
      console.error(error);
      alert("Connection error");
    }
  };

  const handleUnlock = async () => {
    try {
      const res = await fetch("/api/comps/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initialData?._id,
          password: unlockPassword,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setIsLocked(false);
        setShowUnlockModal(false);
        alert("Unlocked! You can now edit.");
      } else {
        alert("Incorrect Password!");
      }
    } catch (error: unknown) {
      console.error(error);
      alert("Verification error");
    }
  };

  const handleEditClick = (index: number) => {
    setEditingSlotIndex(index);
    setIsReadOnlyModal(false);
    setIsModalOpen(true);
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
    "Bomb Squad",
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
      // weaponId'yi de güncelle ki listede görünsün
      newComp[editingSlotIndex].weaponId = finalBuildData.mainHand;
      setComposition(newComp);
      setIsModalOpen(false);
      setEditingSlotIndex(null);
    }
  };

  const generateDiscordText = () => {
    let text = `**${title.toUpperCase()}**\n`;
    if (description) text += `*${description}*\n`;
    if (rallyPoint) text += `📍 **Rally:** ${rallyPoint}\n`;
    if (swap) text += `🔄 **Swap:** ${swap}\n\n`;
    composition.forEach((slot, index) => {
      const weaponName = getDisplayName(slot.weaponId, flattenItems);
      text += `${index + 1}) **${slot.role}** - ${
        weaponName || "Any"
      } - @Player Discord Nickname\n`;
    });
    return text;
  };

  // Küçük ikon bileşeni
  const SmallItemIcon = ({ id }: { id: string }) => {
    if (!id) return null;
    return (
      <div className="w-10 h-10 bg-slate-950 rounded border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden relative group">
        {/* ESKİ IMG ETİKETİ YERİNE BU GELECEK: */}
        <Image
          src={`https://render.albiononline.com/v1/item/${id}?quality=4`}
          alt="item"
          width={40} // w-10 = 40px olduğu için
          height={40} // h-10 = 40px olduğu için
          className="object-contain"
          unoptimized // ÖNEMLİ: Vercel kotasını yememesi için
        />

        {/* Tooltip kısmı aynı kalıyor */}
        <div className="absolute bottom-full mb-1 hidden group-hover:block bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 border border-slate-600">
          {getDisplayName(id, flattenItems)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans flex flex-col">
      <div className="max-w-6xl mx-auto space-y-6 grow w-full">
        {/* HEADER */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg flex flex-col items-center justify-center text-center gap-2">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-yellow-500 to-amber-700">
            Albion Composition Maker by KOMANDO35
          </h1>
          <p className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <Coins size={14} className="text-yellow-600" />
            For donation, use in-game mail or dm on{" "}
            <span className="text-yellow-600 font-bold">
              Europe Server
            </span> to{" "}
            <span className="text-slate-300 font-bold">KOMANDO35</span>
          </p>
        </div>

        {/* --- TOOLBAR İÇERİĞİ --- */}
        {showToolbar && (
          <div className="flex gap-2 items-center bg-slate-900/50 p-2 rounded border border-slate-800 flex-wrap">
            {/* 1. KİLİT AÇMA BUTONU (Aynı kalıyor) */}
            {isLocked && (
              <button
                onClick={() => setShowUnlockModal(true)}
                className="bg-yellow-600 hover:bg-yellow-500 px-6 py-2 rounded font-bold flex items-center gap-2 transition text-black"
              >
                <Unlock size={18} /> Edit (Unlock)
              </button>
            )}

            {/* 2. SİLME BUTONU (Aynı kalıyor) */}
            {!isLocked && initialData?._id && (
              <button
                onClick={handleDelete}
                className="bg-red-700 hover:bg-red-600 px-6 py-2 rounded font-bold flex items-center gap-2 transition text-white"
              >
                <Trash2 size={18} /> Delete
              </button>
            )}

            {/* 3. DISCORD KOPYALAMA (DÜZELTİLDİ: shareLink yerine ID kontrolü) */}
            {initialData?._id && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateDiscordText());
                  alert("Discord text copied!");
                }}
                className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded font-bold flex items-center gap-2 transition text-white"
              >
                <Copy size={18} /> Copy Discord Text
              </button>
            )}

            {/* 4. LINK KOPYALAMA (DÜZELTİLDİ: Linki tıklandığı an üretiyoruz) */}
            {initialData?._id && (
              <button
                onClick={() => {
                  // Linki anlık oluşturuyoruz, state kullanmıyoruz
                  const link = `${window.location.origin}/comp/${initialData._id}`;
                  navigator.clipboard.writeText(link);
                  alert("Link Copied!");
                }}
                className="bg-green-700 hover:bg-green-600 px-6 py-2 rounded font-bold flex items-center gap-2 transition text-white ml-auto"
              >
                <LinkIcon size={18} /> Comp Link
              </button>
            )}
          </div>
        )}

        {/* DETAILS INPUTS */}
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
            placeholder="Enter Title Here.."
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

        {/* PLAYER LIST */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-800/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-300">Player List</h3>
            {!isLocked && (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveClick}
                  className="text-blue-400 text-sm flex gap-1 items-center hover:text-blue-300 transition font-bold"
                >
                  <Save size={14} /> Save
                </button>
                <button
                  onClick={() => setComposition([])}
                  className="text-red-400 text-sm flex gap-1 items-center hover:text-red-300 transition"
                >
                  <Trash2 size={14} /> Clear
                </button>
              </div>
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
                  className={`bg-slate-950 border border-slate-700 rounded p-2 text-sm font-bold text-blue-400 w-32 focus:border-blue-500 outline-none ${
                    isLocked ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <div className="flex gap-1 items-center justify-center lg:justify-start min-w-62.5 flex-wrap">
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
                    {getDisplayName(slot.weaponId, flattenItems)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {slot.build.armor
                      ? getDisplayName(slot.build.armor, items.armor || [])
                      : ""}
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

                  {!isLocked && (
                    <>
                      <button
                        onClick={() => handleEditClick(index)}
                        className="bg-yellow-600/10 text-yellow-500 px-4 py-2 rounded border border-yellow-600/30 hover:bg-yellow-600 hover:text-white transition flex gap-2 items-center text-sm font-medium"
                      >
                        <Edit size={16} /> Edit
                      </button>
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
                    </>
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

        {/* --- MODALS --- */}

        {/* IMPORT EDİLEN YENİ BUILD MODAL KULLANILIYOR */}
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
          <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-60 backdrop-blur-sm">
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

        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-60 backdrop-blur-sm">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 w-full max-w-sm text-center">
              <div className="mx-auto bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-blue-500">
                <Save size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Save Composition
              </h3>
              <p className="text-slate-400 mb-4 text-sm">
                Set a password to protect edits (Optional)
              </p>

              <input
                type="password"
                placeholder="New Password (Optional)"
                className={`w-full bg-slate-950 border border-slate-700 p-3 rounded text-white text-center text-lg mb-4 outline-none focus:border-blue-500 ${
                  removePassword ? "opacity-50 cursor-not-allowed" : ""
                }`}
                value={newPassword}
                disabled={removePassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <div
                className="flex items-center justify-center gap-2 mb-4 cursor-pointer"
                onClick={() =>
                  !newPassword && setRemovePassword(!removePassword)
                }
              >
                {removePassword ? (
                  <CheckSquare className="text-red-500" />
                ) : (
                  <Square className="text-slate-600" />
                )}
                <span
                  className={`text-sm ${
                    removePassword ? "text-red-400 font-bold" : "text-slate-400"
                  } ${newPassword ? "opacity-50" : ""}`}
                >
                  Remove password (Make Public)
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-3 text-slate-400 hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSave}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded"
                >
                  CONFIRM SAVE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- FOOTER --- */}
      <footer className="mt-12 text-center text-slate-600 text-sm pb-8">
        <p className="flex items-center justify-center gap-2">
          <Coins size={16} className="text-yellow-600" />
          For donation, use in-game mail or dm on{" "}
          <span className="text-yellow-600 font-bold">
            Europe Server
          </span> to <span className="text-slate-300 font-bold">KOMANDO35</span>
        </p>
      </footer>
    </div>
  );
}
