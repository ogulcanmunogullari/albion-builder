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
  Eye,
  Globe,
  ShieldAlert,
  RefreshCw,
  GripVertical,
  Clock,
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

const DISCORD_ROLE_ICONS = [
  "🎯",
  "👁️",
  "⚡",
  "🧪",
  "📢",
  "🛡️",
  "🚑",
  "⚔️",
  "🏹",
  "🧠",
  "🔥",
  "🧊",
  "⚜️",
  "💣",
  "🦣",
  "🗡️",
  "👤",
  "🔴",
  "🟠",
  "🟡",
  "🟢",
  "🔵",
  "🟣",
  "🟤",
  "⚫",
  "⚪",
  "🔘",
  "❤️",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "🖤",
  "🤎",
  "🤍",
  "💖",
  "💔",
  "✅",
  "❌",
  "⚠️",
  "💤",
  "💎",
  "⭐",
  "🔱",
  "🚩",
];

export default function HomeClient({
  items,
  initialData,
}: {
  items: ICategorizedItems;
  initialData?: IComp;
}) {
  const router = useRouter();
  const flattenItems = useMemo(() => Object.values(items).flat(), [items]);

  const [hasAccess, setHasAccess] = useState(!initialData?.viewerPassword);
  const [isLocked, setIsLocked] = useState(!!initialData?.password);
  const [viewerPassInput, setViewerPassInput] = useState("");
  const [unlockPassword, setUnlockPassword] = useState("");
  const [title, setTitle] = useState(initialData?.title || "");
  const [rallyPoint, setRallyPoint] = useState(initialData?.rallyPoint || "");
  const [eventTime, setEventTime] = useState(initialData?.swap || "");
  const [composition, setComposition] = useState<ISlot[]>(
    initialData?.slots || []
  );
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [viewerPassword, setViewerPassword] = useState(
    initialData?.viewerPassword || ""
  );
  const [newPassword, setNewPassword] = useState("");
  const [openIconPickerIndex, setOpenIconPickerIndex] = useState<number | null>(
    null
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"main" | "swap">("main");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ISlot | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // --- DRAG AND DROP ---
  const handleDragStart = (index: number) => {
    if (isLocked) return;
    setDraggedItemIndex(index);
  };
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    const newComp = [...composition];
    const draggedItem = newComp[draggedItemIndex];
    newComp.splice(draggedItemIndex, 1);
    newComp.splice(index, 0, draggedItem);
    setDraggedItemIndex(index);
    setComposition(newComp);
  };

  // --- BUILD MODAL SAVE FIX ---
  const updateSlotBuild = (newBuild: IBuild, shouldClose: boolean = true) => {
    if (editingSlotIndex === null) return;
    const newComp = [...composition];

    // Eğer index mevcut değilse (yeni ekleme), yeni slot oluştur
    if (editingSlotIndex >= newComp.length) {
      newComp.push({
        id: Date.now(),
        role: "",
        roleIcon: "👤",
        weaponId: newBuild.mainHand,
        build: newBuild,
        isSwapActive: false,
      });
    } else {
      // Mevcut slotu güncelle
      const targetSlot = newComp[editingSlotIndex];
      if (modalMode === "main") {
        targetSlot.build = newBuild;
        targetSlot.weaponId = newBuild.mainHand;
      } else {
        targetSlot.swapBuild = newBuild;
      }
    }

    setComposition(newComp);
    if (shouldClose) {
      setIsModalOpen(false);
      setEditingSlotIndex(null);
    }
  };

  const toggleSwapActive = (index: number) => {
    const newComp = [...composition];
    if (!newComp[index]) return;
    newComp[index].isSwapActive = !newComp[index].isSwapActive;
    setComposition(newComp);
  };

  // --- SAVE SETUP FIX ---
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
          swap: eventTime,
          isPublic,
          viewerPassword: isPublic ? "" : viewerPassword,
          password: unlockPassword || initialData?.password,
          nextPassword: newPassword || initialData?.password,
          slots: composition,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("✅ Setup Saved!");
        isNewRecord ? router.push("/") : window.location.reload();
      } else {
        alert(`❌ Error: ${data.message || "Authorization failed"}`);
      }
    } catch {
      alert("Save failed!");
    }
  };

  const handleCopyTemplate = () => {
    const baseUrl = window.location.origin;
    const compUrl = `${baseUrl}/comp/${initialData?._id}`;
    let text = `# ⚔️ ${title.toUpperCase()} ⚔️\n\`\`\`\n`;
    if (rallyPoint) text += `📍 RALLY: ${rallyPoint}\n`;
    if (eventTime) text += `⏰ TIME : ${eventTime} UTC\n`;
    text +=
      "```\n🔗 **LINK:** " + (initialData?._id ? compUrl : "Not Saved") + "\n";
    if (viewerPassword)
      text += `🔑 **PASS:** \`${viewerPassword}\` (Case Sensitive)\n`;
    text += "\n**👥 Player List:**\n";
    composition.forEach((slot, index) => {
      const num = (index + 1).toString().padStart(2, "0");
      const icon = slot.roleIcon || "👤";
      const mainWp = getDisplayName(slot.weaponId, flattenItems);
      const swapWp = slot.swapBuild?.mainHand
        ? getDisplayName(slot.swapBuild.mainHand, flattenItems)
        : null;
      text += `\`${num}\` ${icon} **${slot.role.toUpperCase()}** - Main: ${
        mainWp || "Any"
      }`;
      if (swapWp) text += ` | 🔄 Swap: ${swapWp}`;
      text += ` - _@Player_\n`;
    });
    navigator.clipboard
      .writeText(text)
      .then(() => alert("📋 Template copied!"));
  };

  const handleUnlock = () => {
    if (unlockPassword === initialData?.password) {
      setIsLocked(false);
      setShowUnlockModal(false);
    } else alert("❌ Invalid Access Key!");
  };

  // --- DELETE COMP FUNCTION ---
  const handleDeleteComp = async () => {
    if (
      !initialData?._id ||
      !confirm("⚠️ This build will be completely deleted. Are you sure?")
    )
      return;
    try {
      const res = await fetch(`/api/comps/delete?id=${initialData._id}`, {
        method: "DELETE",
      });
      if ((await res.json()).success) {
        alert("🗑️ Deleted.");
        router.push("/");
      }
    } catch {
      alert("Error deleting build!");
    }
  };

  if (!hasAccess && initialData?.viewerPassword) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-[500] p-4 backdrop-blur-md">
        <div className="max-w-sm w-full bg-slate-900 border border-slate-800 p-8 rounded-[40px] text-center space-y-6 shadow-2xl">
          <Lock size={40} className="mx-auto text-red-500" />
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">
            Security Protocol
          </h2>
          <input
            type="password"
            value={viewerPassInput}
            onChange={(e) => setViewerPassInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center text-white outline-none focus:border-red-500 font-bold"
            placeholder="Access Code..."
          />
          <button
            onClick={() =>
              viewerPassInput === initialData?.viewerPassword
                ? setHasAccess(true)
                : alert("Access Denied!")
            }
            className="w-full py-4 bg-red-600 text-white font-black rounded-2xl uppercase tracking-[0.2em] shadow-lg"
          >
            Authenticate Intel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-8 pb-20 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl relative overflow-hidden">
          <input
            value={title}
            onChange={(e) => !isLocked && setTitle(e.target.value)}
            disabled={isLocked}
            className="w-full bg-transparent text-3xl font-black border-b border-slate-800 focus:border-yellow-500 outline-none p-2 uppercase italic tracking-tighter"
            placeholder="Enter Event Title Here..."
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
                className="w-full bg-slate-950 p-3 pl-10 rounded-xl border border-slate-800 outline-none italic placeholder:text-slate-700"
                placeholder="Enter Deployment Rally Point Here..."
              />
            </div>
            <div className="relative">
              <Clock
                className="absolute left-3 top-3 text-slate-500"
                size={18}
              />
              <input
                value={eventTime}
                onChange={(e) => !isLocked && setEventTime(e.target.value)}
                disabled={isLocked}
                className="w-full bg-slate-950 p-3 pl-10 rounded-xl border border-slate-800 outline-none italic placeholder:text-slate-700"
                placeholder="Enter Event Time Here... (e.g. 18:00 UTC)"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-4 bg-slate-800/30 grid grid-cols-1 md:grid-cols-3 items-center gap-4 border-b border-slate-800">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              {!isLocked && (
                <span className="text-[9px] text-yellow-600 font-black uppercase italic mt-1 animate-pulse tracking-tighter">
                  Drag & Drop Sort
                </span>
              )}
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleCopyTemplate}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2.5 rounded-xl font-black text-[11px] flex items-center gap-2 uppercase italic shadow-lg shadow-indigo-600/30 transition-all active:scale-95 border border-indigo-400/20 tracking-[0.1em]"
              >
                <Copy size={16} /> Copy Discord Template
              </button>
            </div>

            <div className="flex justify-center md:justify-end gap-2">
              {isLocked ? (
                <button
                  onClick={() => setShowUnlockModal(true)}
                  className="bg-red-600/10 text-red-500 font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition border border-red-600/20 text-xs uppercase hover:bg-red-600 hover:text-white shadow-inner"
                >
                  <Lock size={14} /> Admin Access
                </button>
              ) : (
                <div className="flex justify-center md:justify-end gap-2">
                  {isLocked ? (
                    <button
                      onClick={() => setShowUnlockModal(true)}
                      className="bg-red-600/10 text-red-500 font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition border border-red-600/20 text-xs uppercase hover:bg-red-600 hover:text-white shadow-inner"
                    >
                      <Lock size={14} /> Admin Access
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
                        className="bg-blue-600 hover:bg-blue-500 text-white font-black py-2 px-4 rounded-xl flex items-center gap-2 transition text-xs uppercase shadow-lg shadow-blue-600/20 border border-blue-400/20"
                      >
                        <Save size={14} /> Save Setup
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-800/50">
            {composition.map((slot, index) => (
              <div
                key={slot.id}
                draggable={!isLocked}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={() => setDraggedItemIndex(null)}
                className={`p-4 transition-all group space-y-3 relative ${
                  draggedItemIndex === index
                    ? "opacity-20 bg-yellow-500/5 scale-[0.98]"
                    : "hover:bg-slate-800/10"
                }`}
              >
                <div className="flex flex-col lg:flex-row items-center gap-4">
                  <div
                    className={`flex flex-col items-center justify-center p-1 text-slate-700 transition ${
                      isLocked
                        ? "hidden"
                        : "cursor-grab active:cursor-grabbing hover:text-yellow-500 block"
                    }`}
                  >
                    <span className="text-[7px] font-black text-slate-600 uppercase mb-0.5 tracking-tighter">
                      Sort
                    </span>
                    <GripVertical size={22} />
                  </div>
                  <span className="font-mono text-slate-600 font-bold w-4">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <div className="flex gap-1 items-center bg-slate-950 border border-slate-700 rounded-xl p-1 shadow-inner shrink-0 group-hover:border-slate-500 transition-colors">
                    {/* ICON PICKER AREA */}
                    <div className="relative">
                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenIconPickerIndex(
                            openIconPickerIndex === index ? null : index
                          );
                        }}
                        className="bg-slate-800 text-lg px-2 py-1 rounded-lg hover:bg-slate-700 transition shadow flex items-center justify-center min-w-[44px] h-[36px] border border-slate-700 active:scale-95"
                      >
                        {slot.roleIcon || "👤"}
                      </button>
                      {openIconPickerIndex === index && (
                        <>
                          <div
                            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                            onClick={() => setOpenIconPickerIndex(null)}
                          />
                          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[210] bg-slate-900 border border-slate-700 p-4 rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.8)] w-[90%] max-w-[400px] animate-in zoom-in-95 duration-200">
                            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-[60vh] overflow-y-auto p-1">
                              {DISCORD_ROLE_ICONS.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => {
                                    const newComp = [...composition];
                                    newComp[index].roleIcon = emoji;
                                    setComposition(newComp);
                                    setOpenIconPickerIndex(null);
                                  }}
                                  className="text-2xl p-2 hover:bg-slate-800 rounded-2xl transition-all hover:scale-125 active:scale-90 flex items-center justify-center"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={() => setOpenIconPickerIndex(null)}
                              className="w-full mt-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[10px] font-black uppercase rounded-2xl transition-all border border-slate-700/50"
                            >
                              Dismiss Picker
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    <input
                      value={slot.role}
                      disabled={isLocked}
                      onChange={(e) => {
                        const newComp = [...composition];
                        newComp[index].role = e.target.value;
                        setComposition(newComp);
                      }}
                      placeholder="Enter Role Here..."
                      className="bg-transparent text-xs font-black text-blue-400 w-40 outline-none uppercase italic px-2 placeholder:text-slate-800"
                    />
                  </div>
                  <div
                    className="flex gap-1 flex-wrap cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLocked) {
                        setEditingSlotIndex(index);
                        setModalMode("main");
                        setIsModalOpen(true);
                      }
                    }}
                  >
                    {Object.entries(slot.build).map(([key, itemId]) => (
                      <SmallItemIcon
                        key={key}
                        id={itemId as string}
                        name={getDisplayName(itemId as string, flattenItems)}
                      />
                    ))}
                  </div>
                  <div className="flex-1 font-bold text-slate-200 text-center lg:text-left truncate uppercase italic tracking-tighter leading-none">
                    {getDisplayName(slot.weaponId, flattenItems) ||
                      "Empty Unit Slot"}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSwapActive(index)}
                      className={`p-2 rounded-lg transition shadow-sm ${
                        slot.isSwapActive
                          ? "bg-yellow-500 text-black shadow-yellow-500/20"
                          : "text-slate-500 hover:text-white bg-slate-800/50"
                      }`}
                    >
                      <RefreshCw size={20} />
                    </button>
                    {!isLocked && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSlotIndex(index);
                          setModalMode("main");
                          setIsModalOpen(true);
                        }}
                        className="bg-blue-600/10 text-blue-500 p-2 rounded-lg border border-blue-600/20 hover:bg-blue-600 hover:text-white transition shadow-sm shadow-blue-900/10"
                      >
                        <Edit size={20} />
                      </button>
                    )}
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
                      <button
                        onClick={() =>
                          setComposition(
                            composition.filter((_, i) => i !== index)
                          )
                        }
                        className="p-2 text-slate-600 hover:text-red-500 transition hover:bg-red-500/5 rounded-lg"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>

                {slot.isSwapActive && (
                  <div className="ml-16 p-4 bg-yellow-500/5 border-l-2 border-yellow-500/30 rounded-r-2xl flex flex-wrap items-center gap-4 animate-in slide-in-from-left-2 duration-300">
                    <span className="text-[10px] font-black text-yellow-500 uppercase italic tracking-widest leading-none">
                      🔄 Swap:
                    </span>
                    <div
                      className="flex gap-1 flex-wrap cursor-pointer"
                      onClick={() =>
                        !isLocked &&
                        (setEditingSlotIndex(index),
                        setModalMode("swap"),
                        setIsModalOpen(true))
                      }
                    >
                      {slot.swapBuild ? (
                        Object.entries(slot.swapBuild)
                          .filter(
                            ([key, itemId]) =>
                              itemId && itemId !== "" && key !== "_id"
                          )
                          .map(([key, itemId]) => (
                            <SmallItemIcon
                              key={key}
                              id={itemId as string}
                              name={getDisplayName(
                                itemId as string,
                                flattenItems
                              )}
                            />
                          ))
                      ) : (
                        <div className="text-[10px] text-yellow-500/30 font-black uppercase italic px-4 py-2 border border-dashed border-yellow-500/10 rounded-lg tracking-[0.2em]">
                          Save Tactical Swap
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {!isLocked && (
            <button
              onClick={() => {
                setEditingSlotIndex(composition.length);
                setModalMode("main");
                setIsModalOpen(true);
              }}
              className="w-full py-5 bg-slate-800/10 hover:bg-yellow-500/5 text-slate-500 hover:text-yellow-500 transition-all border-t border-slate-800 font-black flex justify-center items-center gap-3 uppercase tracking-[0.4em] text-sm italic active:bg-yellow-500/10"
            >
              <Plus size={20} /> Add New Role
            </button>
          )}
        </div>
      </div>

      <BuildModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSlotIndex(null);
        }}
        slot={editingSlotIndex !== null ? composition[editingSlotIndex] : null}
        onSave={(build) => updateSlotBuild(build, true)}
        onSoftSave={(build) => updateSlotBuild(build, false)}
        allItems={items}
        mode={modalMode}
        setModalMode={setModalMode}
      />
      <ViewBuildModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        slot={selectedSlot}
        allItems={items}
      />

      {showUnlockModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[700] backdrop-blur-md p-4 text-center">
          <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-700 w-full max-w-sm text-center space-y-6 shadow-2xl">
            <ShieldAlert size={48} className="mx-auto text-yellow-500" />
            <h3 className="text-xl font-black text-white uppercase italic tracking-widest">
              Admin Authorization
            </h3>
            <input
              type="password"
              value={unlockPassword}
              onChange={(e) => setUnlockPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center text-white outline-none focus:border-yellow-500 font-bold tracking-widest"
              placeholder="Admin Password..."
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowUnlockModal(false)}
                className="flex-1 py-3 text-slate-500 font-black uppercase text-xs tracking-widest transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlock}
                className="flex-1 py-4 bg-yellow-600 text-black font-black rounded-2xl uppercase text-xs tracking-widest shadow-lg shadow-yellow-600/30"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[600] backdrop-blur-md p-4 text-center">
          <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-700 w-full max-w-md space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-white text-center uppercase tracking-[0.3em] italic leading-none">
              Save Setup
            </h3>
            <div className="space-y-5">
              <div className="flex gap-2 p-1.5 bg-slate-950 rounded-3xl border border-slate-800 shadow-inner">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`flex-1 py-4 rounded-[18px] font-black flex items-center justify-center gap-2 transition-all text-xs tracking-widest ${
                    isPublic
                      ? "bg-yellow-600 text-black shadow-lg shadow-yellow-600/20"
                      : "text-slate-600"
                  }`}
                >
                  <Globe size={18} /> PUBLIC
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`flex-1 py-4 rounded-[18px] font-black flex items-center justify-center gap-2 transition-all text-xs tracking-widest ${
                    !isPublic
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                      : "text-slate-600"
                  }`}
                >
                  <Lock size={18} /> PRIVATE
                </button>
              </div>
              {!isPublic && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-3 italic tracking-widest">
                    Viewer Password
                  </label>
                  <input
                    type="password"
                    value={viewerPassword}
                    onChange={(e) => setViewerPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-[20px] text-white outline-none font-bold italic tracking-widest placeholder:text-slate-800"
                    placeholder="Set viewer pass..."
                  />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-3 italic tracking-widest">
                  Admin Access Key
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-4 rounded-[20px] text-white outline-none font-bold italic tracking-widest placeholder:text-slate-800"
                  placeholder="Set admin pass..."
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 py-4 text-slate-500 font-black uppercase text-xs tracking-widest transition-colors hover:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSave}
                className="flex-1 py-4 bg-blue-600 text-white font-black rounded-[22px] uppercase shadow-lg text-xs tracking-widest shadow-blue-600/20 hover:bg-blue-500 active:scale-95 transition-all"
              >
                Save Setup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
