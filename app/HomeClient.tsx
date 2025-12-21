"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Trash2,
  Plus,
  Edit,
  Save,
  Lock,
  MapPin,
  Repeat,
  Eye,
  Globe,
  ShieldAlert,
} from "lucide-react";

import { ISlot, IBuild, ICategorizedItems, IComp } from "@/types";
import { getDisplayName } from "@/utils/helpers";
import BuildModal from "@/components/BuildModal";
import ItemLoader from "@/components/ItemLoader";
import ViewBuildModal from "@/components/ViewBuildModal";

const SmallItemIcon = React.memo(
  ({ id, name }: { id: string; name: string }) => {
    if (!id) return null;
    return (
      <div className="w-10 h-10 bg-slate-950 rounded border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden relative group">
        <ItemLoader
          src={`https://render.albiononline.com/v1/item/${id}?quality=4`}
          alt={name}
          size={40}
        />
        <div className="absolute bottom-full mb-1 hidden group-hover:block bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-30 font-bold border border-slate-700 shadow-xl italic uppercase">
          {name}
        </div>
      </div>
    );
  }
);
SmallItemIcon.displayName = "SmallItemIcon";

export default function HomeClient({
  items,
  initialData,
}: {
  items: ICategorizedItems;
  initialData?: IComp;
}) {
  const router = useRouter();
  const flattenItems = useMemo(() => Object.values(items).flat(), [items]);

  // --- YETKİLENDİRME STATE ---
  const [hasAccess, setHasAccess] = useState(!initialData?.viewerPassword);
  const [isLocked, setIsLocked] = useState(!!initialData?.password);
  const [viewerPassInput, setViewerPassInput] = useState("");
  const [unlockPassword, setUnlockPassword] = useState("");

  // --- FORM STATE ---
  const [title, setTitle] = useState(initialData?.title || "");
  const [rallyPoint, setRallyPoint] = useState(initialData?.rallyPoint || "");
  const [swap, setSwap] = useState(initialData?.swap || "");
  const [composition, setComposition] = useState<ISlot[]>(
    initialData?.slots || []
  );
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [viewerPassword, setViewerPassword] = useState(
    initialData?.viewerPassword || ""
  );
  const [newPassword, setNewPassword] = useState("");

  // --- MODALLAR ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ISlot | null>(null);

  const ROLES = [
    "Caller",
    "Tank",
    "Healer",
    "Axe",
    "Sword",
    "Support",
    "Fire Staff",
    "Frost Staff",
    "Bow",
    "Crossbow",
    "Looter",
    "Cursed Staff",
    "Bomb Squad",
    "Battle Mount",
  ];

  // --- SLOT GÜNCELLEME ---
  const updateSlotBuild = (build: IBuild) => {
    if (editingSlotIndex !== null) {
      const isNew = editingSlotIndex >= composition.length;
      const updatedSlot: ISlot = {
        id: isNew ? Date.now() : composition[editingSlotIndex].id,
        role: isNew ? "Tank" : composition[editingSlotIndex].role,
        weaponId: build.mainHand,
        build: build,
      };
      if (isNew) setComposition([...composition, updatedSlot]);
      else {
        const newComp = [...composition];
        newComp[editingSlotIndex] = updatedSlot;
        setComposition(newComp);
      }
      setIsModalOpen(false);
      setEditingSlotIndex(null);
    }
  };

  // --- KAYIT FONKSİYONU ---
  const confirmSave = async () => {
    try {
      const isNewRecord = !initialData?._id;
      const res = await fetch("/api/comps", {
        method: isNewRecord ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initialData?._id,
          title,
          rallyPoint,
          swap,
          isPublic,
          viewerPassword: isPublic ? "" : viewerPassword,
          password: unlockPassword || initialData?.password,
          nextPassword: newPassword || initialData?.password,
          slots: composition,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("✅ Build successfully saved!");
        if (isNewRecord && data.id) {
          router.push(`/comp/${data.id}`);
        } else {
          window.location.reload();
        }
      } else {
        alert("Hata: " + (data.error || "Registration failed."));
      }
    } catch {
      alert("Connection Error! Could not connect to server.");
    }
  };

  // --- SİLME FONKSİYONU ---
  const handleDeleteComp = async () => {
    if (!initialData?._id) return;
    if (!confirm("⚠️ This build will be completely deleted. Are you sure?"))
      return;
    try {
      const res = await fetch(`/api/comps/delete?id=${initialData._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert("🗑️ Build Deleted.");
        router.push("/search");
      }
    } catch {
      alert("Connection Error!");
    }
  };

  // --- DISCORD KOPYALAMA ---
  const handleCopyTemplate = () => {
    const baseUrl = window.location.origin;
    const compUrl = `${baseUrl}/comp/${initialData?._id}`;
    const roleConfig: Record<string, { emoji: string; label: string }> = {
      Caller: { emoji: "📢", label: "Caller" },
      Tank: { emoji: "🛡️", label: "Tank" },
      Support: { emoji: "🧠", label: "Support" },
      Healer: { emoji: "🚑", label: "Healer" },
      Sword: { emoji: "⚔️", label: "Sword" },
      Axe: { emoji: "🪓", label: "Axe" },
      "Fire Staff": { emoji: "🔥", label: "Fire Staff" },
      "Frost Staff": { emoji: "🧊", label: "Frost Staff" },
      Bow: { emoji: "🏹", label: "Bow" },
      Crossbow: { emoji: "🏹", label: "Crossbow" },
      Looter: { emoji: "🗡️", label: "Looter" },
      "Cursed Staff": { emoji: "⚜️", label: "Cursed Staff" },
      "Bomb Squad": { emoji: "💣", label: "Bomb Squad" },
      "Battle Mount": { emoji: "🦣", label: "Battle Mount" },
    };

    const roleSummary = composition.reduce(
      (acc: Record<string, number>, slot) => {
        acc[slot.role] = (acc[slot.role] || 0) + 1;
        return acc;
      },
      {}
    );

    let text = `# ⚔️ ${title.toUpperCase()} ⚔️\n\`\`\`\n`;
    if (rallyPoint) text += `📍 RALLY: ${rallyPoint}\n`;
    if (swap) text += `🔄 SWAP : ${swap}\n`;
    text += "```\n";
    // Link ve Şifre Bölümü (Yeni)
    text += `🔗 **BUILD LINK:** ${
      initialData?._id ? compUrl : "Not Saved Yet"
    }\n`;
    if (viewerPassword) {
      text += `🔑 **VIEWER PASS:** \`${viewerPassword}\` (Case Sensitive)\n`;
    }
    text += "\n";
    text += "```\n**📊 ROLE SUMMARY:**\n";
    text +=
      Object.entries(roleSummary)
        .map(([role, count]) => {
          const config = roleConfig[role] || { emoji: "👤", label: role };
          return `${config.emoji} ${config.label}: **${count}**`;
        })
        .join("  |  ") + "\n\n**👥 Player List:**\n";

    composition.forEach((slot, index) => {
      const weaponName = getDisplayName(slot.weaponId, flattenItems);
      const config = roleConfig[slot.role] || { emoji: "👤", label: slot.role };
      const num = (index + 1).toString().padStart(2, "0");
      text += `\`${num}\` ${config.emoji} **${slot.role}** - ${
        weaponName || "Any Weapon"
      } - _@Player_\n`;
    });

    navigator.clipboard
      .writeText(text)
      .then(() => alert("📋 Copy to clipboard!"));
  };

  const handleUnlock = () => {
    if (unlockPassword === initialData?.password) {
      setIsLocked(false);
      setShowUnlockModal(false);
    } else alert("❌ Wrong Admin Password!");
  };

  // --- VIEWER GATE ---
  if (!hasAccess && initialData?.viewerPassword) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-500 p-4 backdrop-blur-md">
        <div className="max-w-sm w-full bg-slate-900 border border-slate-800 p-8 rounded-[40px] text-center space-y-6 shadow-2xl">
          <Lock size={40} className="mx-auto text-red-500" />
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
            Protected To View
          </h2>
          <input
            type="password"
            value={viewerPassInput}
            onChange={(e) => setViewerPassInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              (viewerPassInput === initialData?.viewerPassword
                ? setHasAccess(true)
                : alert("Hatalı!"))
            }
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center text-white font-bold outline-none focus:border-red-500"
            placeholder="Viewer Password..."
          />
          <button
            onClick={() =>
              viewerPassInput === initialData?.viewerPassword
                ? setHasAccess(true)
                : alert("Hatalı!")
            }
            className="w-full py-4 bg-red-600 text-white font-black rounded-2xl uppercase tracking-widest"
          >
            View Build
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-8 pb-20 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl relative overflow-hidden">
          <input
            value={title}
            onChange={(e) => !isLocked && setTitle(e.target.value)}
            disabled={isLocked}
            className="w-full bg-transparent text-3xl font-black border-b border-slate-800 focus:border-yellow-500 outline-none p-2 italic uppercase tracking-tighter"
            placeholder="Build Title..."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <MapPin
                className="absolute left-3 top-3 text-slate-500"
                size={18}
              />
              <input
                value={rallyPoint}
                onChange={(e) => !isLocked && setRallyPoint(e.target.value)}
                disabled={isLocked}
                className="w-full bg-slate-950 p-3 pl-10 rounded-xl border border-slate-800 outline-none italic"
                placeholder="Rally Point"
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
                disabled={isLocked}
                className="w-full bg-slate-950 p-3 pl-10 rounded-xl border border-slate-800 outline-none italic"
                placeholder="Swap Info"
              />
            </div>
          </div>
        </div>

        {/* TEAM COMPOSITION */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-4 bg-slate-800/30 flex flex-wrap justify-between items-center gap-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <h3 className="font-black text-slate-400 uppercase text-xs italic">
                Team Composition
              </h3>
              <button
                onClick={handleCopyTemplate}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all uppercase italic shadow-lg shadow-indigo-600/20"
              >
                <Copy size={12} /> Copy Discord Template
              </button>
            </div>
            <div className="flex gap-2">
              {isLocked ? (
                <button
                  onClick={() => setShowUnlockModal(true)}
                  className="bg-red-600/10 text-red-500 font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition border border-red-600/20 text-xs uppercase hover:bg-red-600 hover:text-white"
                >
                  <Lock size={14} /> Unlock to Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  {initialData?._id && (
                    <button
                      onClick={handleDeleteComp}
                      className="bg-red-600/10 text-red-500 font-black py-2 px-4 rounded-xl flex items-center gap-2 transition border border-red-600/20 text-xs uppercase hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black py-2 px-4 rounded-xl flex items-center gap-2 transition text-xs uppercase shadow-lg shadow-blue-600/20"
                  >
                    <Save size={14} /> Save Settings
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-800/50">
            {composition.map((slot, index) => (
              <div
                key={slot.id}
                className="flex flex-col lg:flex-row items-center gap-4 p-4 hover:bg-slate-800/20 transition group"
              >
                <span className="font-mono text-slate-600 font-bold w-6">
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <select
                  value={slot.role}
                  disabled={isLocked}
                  onChange={(e) => {
                    const newComp = [...composition];
                    newComp[index].role = e.target.value;
                    setComposition(newComp);
                  }}
                  className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm font-bold text-blue-400 w-36 outline-none uppercase italic"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <div className="flex gap-1 flex-wrap justify-center lg:justify-start">
                  {Object.entries(slot.build).map(([key, itemId]) => (
                    <SmallItemIcon
                      key={key}
                      id={itemId as string}
                      name={getDisplayName(itemId as string, flattenItems)}
                    />
                  ))}
                </div>
                <div className="flex-1 font-bold text-slate-200 text-center lg:text-left truncate uppercase italic tracking-tighter">
                  {getDisplayName(slot.weaponId, flattenItems) || "Any Weapon"}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedSlot(slot);
                      setIsViewModalOpen(true);
                    }}
                    className="p-2 text-slate-500 hover:text-white transition"
                  >
                    <Eye size={20} />
                  </button>
                  {!isLocked && (
                    <>
                      <button
                        onClick={() => {
                          const source = composition[index];
                          const newSlot = {
                            ...source,
                            id: Date.now(),
                            build: { ...source.build },
                          };
                          const newComp = [...composition];
                          newComp.splice(index + 1, 0, newSlot);
                          setComposition(newComp);
                        }}
                        className="p-2 text-slate-500 hover:text-blue-400 transition"
                        title="Duplicate"
                      >
                        <Copy size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingSlotIndex(index);
                          setIsModalOpen(true);
                        }}
                        className="bg-yellow-600/10 text-yellow-500 px-4 py-1.5 rounded-lg border border-yellow-600/20 font-bold hover:bg-yellow-600 hover:text-black transition flex items-center gap-1 text-xs"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={() =>
                          setComposition(
                            composition.filter((_, i) => i !== index)
                          )
                        }
                        className="p-2 text-slate-600 hover:text-red-500 transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          {!isLocked && (
            <button
              onClick={() => {
                setEditingSlotIndex(composition.length);
                setIsModalOpen(true);
              }}
              className="w-full py-6 bg-slate-800/10 hover:bg-yellow-500/5 text-slate-500 hover:text-yellow-500 transition-all border-t border-slate-800 font-bold flex justify-center items-center gap-2 uppercase tracking-[0.2em] text-sm italic"
            >
              <Plus size={20} /> Add New Player
            </button>
          )}
        </div>
      </div>

      {/* ADMIN UNLOCK MODAL */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-700 backdrop-blur-md p-4">
          <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-700 w-full max-w-sm text-center space-y-6 shadow-2xl">
            <ShieldAlert size={48} className="mx-auto text-yellow-500" />
            <h3 className="text-xl font-black text-white uppercase italic tracking-widest">
              Admin Unlock
            </h3>
            <input
              type="password"
              value={unlockPassword}
              onChange={(e) => setUnlockPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center text-white font-bold outline-none focus:border-yellow-500"
              placeholder="Admin Password..."
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowUnlockModal(false)}
                className="flex-1 py-3 text-slate-500 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlock}
                className="flex-1 py-4 bg-yellow-600 text-black font-black rounded-2xl uppercase text-xs"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAVE SETTINGS MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-600 backdrop-blur-md p-4">
          <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-700 w-full max-w-md space-y-6 shadow-2xl">
            <h3 className="text-xl font-black text-white text-center uppercase tracking-[0.3em] italic">
              Settings
            </h3>
            <div className="space-y-5">
              <div className="flex gap-2 p-1.5 bg-slate-950 rounded-3xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`flex-1 py-4 rounded-[18px] font-bold transition-all flex items-center justify-center gap-2 ${
                    isPublic
                      ? "bg-yellow-600 text-black shadow-lg"
                      : "text-slate-500"
                  }`}
                >
                  <Globe size={18} /> Public
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`flex-1 py-4 rounded-[18px] font-bold transition-all flex items-center justify-center gap-2 ${
                    !isPublic
                      ? "bg-red-600 text-white shadow-lg"
                      : "text-slate-500"
                  }`}
                >
                  <Lock size={18} /> Private
                </button>
              </div>
              {!isPublic && (
                <div className="space-y-1 animate-in fade-in zoom-in-95 duration-200">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-3 tracking-widest italic">
                    Viewer Password
                  </label>
                  <input
                    type="password"
                    value={viewerPassword}
                    onChange={(e) => setViewerPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-[20px] text-white outline-none focus:border-red-500 italic"
                    placeholder="Set viewer pass..."
                  />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-3 tracking-widest italic">
                  Admin Password (Edit)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-4 rounded-[20px] text-white outline-none focus:border-yellow-500 italic"
                  placeholder="Set admin pass..."
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 py-4 text-slate-500 font-bold uppercase text-xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                className="flex-1 py-4 bg-blue-600 text-white font-black rounded-[22px] uppercase text-xs shadow-lg shadow-blue-600/20"
              >
                Save All
              </button>
            </div>
          </div>
        </div>
      )}

      <BuildModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSlotIndex(null);
        }}
        slot={
          editingSlotIndex !== null && editingSlotIndex < composition.length
            ? composition[editingSlotIndex]
            : null
        }
        onSave={updateSlotBuild}
        allItems={items}
      />
      <ViewBuildModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        slot={selectedSlot}
        allItems={items}
      />
    </div>
  );
}
