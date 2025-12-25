"use client";

import React, { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Copy,
  Trash2,
  Lock,
  Save,
  Globe,
  ShieldAlert,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

import { IComposition, ICategorizedItems, IPlayer } from "@/types";
import { getDisplayName } from "@/utils/helpers";
import { useCompositionStore } from "@/store/useCompositionStore";
// YENİ UI STORE
import { useCompositionUiStore } from "@/store/useCompositionUiStore";

// Componentler
import CompHeader from "./CompHeader";
import SlotItem from "./SlotItem";
import BuildModal from "@/components/BuildModal";
import ViewBuildModal from "@/components/ViewBuildModal";

interface CompositionContainerProps {
  items: ICategorizedItems;
  initialData?: IComposition;
  hasAdminPassword?: boolean;
}

export default function CompositionContainer({
  items,
  initialData,
  hasAdminPassword = false,
}: CompositionContainerProps) {
  const router = useRouter();

  // GLOBAL DATA STORE
  const { comp, setComp, resetComp, addPlayer, updateCompDetails } =
    useCompositionStore();

  // LOCAL UI STORE (Tüm useState'lerin yerini aldı)
  const ui = useCompositionUiStore();

  const composition = comp.slots;
  const flattenItems = useMemo(() => Object.values(items).flat(), [items]);

  // --- BAŞLANGIÇ AYARLARI (useEffect) ---
  useEffect(() => {
    // 1. Global Veriyi Yükle
    if (initialData) {
      setComp(initialData);
    } else {
      resetComp();
    }

    // 2. UI State'ini Başlat (Title, şifreler vs.)
    ui.initializeUi(initialData, hasAdminPassword);

    // Unmount olunca temizle
    return () => ui.resetUi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, hasAdminPassword]);

  // --- ACTIONS ---
  const setComposition = (newSlots: IPlayer[]) =>
    updateCompDetails({ slots: newSlots });

  const handlePreSaveValidation = () => {
    const newErrors = {
      title: !ui.title.trim(),
      rally: !ui.rallyPoint.trim(),
      time: !ui.eventTime.trim(),
    };

    ui.setUi({ errors: newErrors });

    if (newErrors.title || newErrors.rally || newErrors.time) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    ui.setUi({
      newPassword: ui.unlockPassword,
      showPasswordModal: true,
    });
  };

  const handleDragStart = (index: number) =>
    !ui.isLocked && ui.setUi({ draggedItemIndex: index });

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (ui.draggedItemIndex === null || ui.draggedItemIndex === index) return;
    const newComp = [...composition];
    const draggedItem = newComp[ui.draggedItemIndex];
    newComp.splice(ui.draggedItemIndex, 1);
    newComp.splice(index, 0, draggedItem);

    ui.setUi({ draggedItemIndex: index });
    setComposition(newComp);
  };

  const handleDragEnd = () => ui.setUi({ draggedItemIndex: null });

  const toggleSwap = (index: number) => {
    const newComp = [...composition];
    if (newComp[index]) {
      newComp[index] = {
        ...newComp[index],
        isSwapActive: !newComp[index].isSwapActive,
      };
      setComposition(newComp);
    }
  };

  const handleDuplicateSlot = (index: number) => {
    const slotToClone = composition[index];
    if (!slotToClone) return;
    const newComp = [...composition];
    const clonedSlot = { ...slotToClone, id: Date.now() + Math.random() };
    newComp.splice(index + 1, 0, clonedSlot);
    setComposition(newComp);
  };

  const handleAddNewRole = () => {
    addPlayer();
    const currentSlots = useCompositionStore.getState().comp.slots;
    const newPlayer = currentSlots[currentSlots.length - 1];
    if (newPlayer) {
      ui.setUi({ editingPlayerId: newPlayer.id, isModalOpen: true });
    }
  };

  const handleUnlock = async () => {
    if (!initialData?._id) return;
    try {
      const res = await fetch("/api/composition/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initialData._id,
          password: ui.unlockPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        ui.setUi({ isLocked: false, showUnlockModal: false });
      } else {
        alert("❌ Wrong Password!");
      }
    } catch (error) {
      console.error(error);
      alert("Verification error occurred.");
    }
  };

  const handleCopyTemplate = () => {
    const baseUrl = window.location.origin;
    const compUrl = `${baseUrl}/composition/${initialData?._id}`;
    let text = `# ⚔️ ${ui.title.toUpperCase()} ⚔️\n\n`;

    if (ui.rallyPoint) text += `📍 **RALLY:** ${ui.rallyPoint}`;
    if (ui.eventTime && ui.rallyPoint) text += `    |    `;
    if (ui.eventTime) text += ` ⏰ **TIME:** ${ui.eventTime} UTC `;
    text += `\n`;
    text += `> 🔗 **LINK:** ${
      initialData?._id ? `<${compUrl}>` : "Not Saved"
    }\n`;

    if (ui.viewerPassword) text += `> 🔑 **PASS:** \`${ui.viewerPassword}\`\n`;

    text += `\n**📋 Build List:**\n\n`;

    composition.forEach((slot, index) => {
      const num = (index + 1).toString().padStart(2, "0");
      const icon = slot.roleIcon || "👤";
      const mainWp = getDisplayName(slot.weaponId, flattenItems) || "Any";
      const swapWp = slot.swapBuild?.mainHand
        ? getDisplayName(slot.swapBuild.mainHand, flattenItems)
        : null;

      text += `\`${num}\` ${icon} **${slot.role.toUpperCase()}**`;
      if (swapWp) {
        text += ` - **Main:** ${mainWp}  **Swap:** ${swapWp}`;
      } else {
        text += ` - ${mainWp}`;
      }
      text += ` @\n`;
    });

    navigator.clipboard
      .writeText(text)
      .then(() => alert("📋 Template copied!"));
  };

  const handleDeleteComp = async () => {
    if (
      !initialData?._id ||
      !confirm("⚠️ This build will be completely deleted. Are you sure?")
    )
      return;
    try {
      const res = await fetch(`/api/composition/delete?id=${initialData._id}`, {
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

  const confirmSave = async () => {
    if (ui.isSaving) return;
    ui.setUi({ isSaving: true });

    const isNewRecord = !initialData?._id;
    const passwordPayload = isNewRecord ? ui.newPassword : ui.unlockPassword;

    try {
      const res = await fetch("/api/composition", {
        method: isNewRecord ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initialData?._id,
          title: ui.title,
          rallyPoint: ui.rallyPoint,
          eventTime: ui.eventTime,
          isPublic: ui.isPublic,
          viewerPassword: ui.isPublic ? "" : ui.viewerPassword,
          password: passwordPayload,
          nextPassword: ui.newPassword,
          slots: composition,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("✅ Setup Saved!");
        if (isNewRecord) {
          const newId = data.data?._id || data.id || data._id;
          if (newId) router.push(`/composition/${newId}`);
          else router.push("/");
        } else {
          window.location.reload();
        }
      } else {
        alert(`❌ Error: ${data.message || "Authorization failed"}`);
        ui.setUi({ isSaving: false });
      }
    } catch {
      alert("Save failed!");
      ui.setUi({ isSaving: false });
    }
  };

  // --- VIEWER LOCK SCREEN ---
  if (!ui.hasAccess && initialData?.viewerPassword) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-500 p-4 backdrop-blur-md">
        <div className="max-w-sm w-full bg-slate-900 border border-slate-800 p-8 rounded-[40px] text-center space-y-6 shadow-2xl">
          <Lock size={40} className="mx-auto text-red-500" />
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">
            Viewer Access Required
          </h2>
          <input
            type="password"
            value={ui.viewerPassInput}
            onChange={(e) => ui.setUi({ viewerPassInput: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center text-white outline-none focus:border-red-500 font-bold"
            placeholder="Password..."
          />
          <button
            onClick={() =>
              ui.viewerPassInput === initialData?.viewerPassword
                ? ui.setUi({ hasAccess: true })
                : alert("Wrong Password!")
            }
            className="w-full py-4 bg-red-600 text-white font-black rounded-2xl uppercase tracking-[0.2em] shadow-lg"
          >
            View
          </button>
        </div>
      </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-8 pb-20 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <CompHeader
          title={ui.title}
          setTitle={(val) => {
            ui.setUi({ title: val });
            if (ui.errors.title)
              ui.setUi({ errors: { ...ui.errors, title: false } });
          }}
          rallyPoint={ui.rallyPoint}
          setRallyPoint={(val) => {
            ui.setUi({ rallyPoint: val });
            if (ui.errors.rally)
              ui.setUi({ errors: { ...ui.errors, rally: false } });
          }}
          eventTime={ui.eventTime}
          setEventTime={(val) => {
            ui.setUi({ eventTime: val });
            if (ui.errors.time)
              ui.setUi({ errors: { ...ui.errors, time: false } });
          }}
          isLocked={ui.isLocked}
          errors={ui.errors}
        />

        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          {/* Action Bar */}
          <div className="p-4 bg-slate-800/30 grid grid-cols-1 md:grid-cols-3 items-center gap-4 border-b border-slate-800">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              {!ui.isLocked && (
                <span className="text-[9px] text-yellow-600 font-black uppercase italic mt-1 animate-pulse tracking-tighter">
                  Drag & Drop Sort
                </span>
              )}
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleCopyTemplate}
                disabled={!initialData?._id}
                className={`bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-black text-[11px] flex items-center gap-2 uppercase italic shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/20 tracking-widest
      ${
        !initialData?._id
          ? "opacity-50 cursor-not-allowed grayscale" // Kayıtlı değilse: Sönük ve gri
          : "hover:bg-indigo-500 active:scale-95" // Kayıtlıysa: Efektler aktif
      }`}
              >
                <Copy size={16} /> Copy Discord Template
              </button>
            </div>

            <div className="flex justify-center md:justify-end gap-2">
              {ui.isLocked ? (
                <button
                  onClick={() => ui.setUi({ showUnlockModal: true })}
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
                    onClick={handlePreSaveValidation}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black py-2 px-4 rounded-xl flex items-center gap-2 transition text-xs uppercase shadow-lg shadow-blue-600/20 border border-blue-400/20"
                  >
                    <Save size={14} /> Save Setup
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-800/50">
            {composition.map((slot, index) => (
              <SlotItem
                key={slot.id}
                slot={slot}
                index={index}
                isLocked={ui.isLocked}
                flattenItems={flattenItems}
                draggedItemIndex={ui.draggedItemIndex}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onEdit={(id) =>
                  ui.setUi({ editingPlayerId: id, isModalOpen: true })
                }
                onView={(s) =>
                  ui.setUi({ selectedSlot: s, isViewModalOpen: true })
                }
                onDelete={(id) => {
                  const newComp = composition.filter((p) => p.id !== id);
                  setComposition(newComp);
                }}
                onToggleSwap={toggleSwap}
                onDuplicate={handleDuplicateSlot}
              />
            ))}
          </div>

          {!ui.isLocked && (
            <button
              onClick={handleAddNewRole}
              className="w-full py-5 bg-slate-800/10 hover:bg-yellow-500/5 text-slate-500 hover:text-yellow-500 transition-all border-t border-slate-800 font-black flex justify-center items-center gap-3 uppercase tracking-[0.4em] text-sm italic active:bg-yellow-500/10"
            >
              <Plus size={20} /> Add New Role
            </button>
          )}
        </div>
      </div>

      {/* MODALS */}
      {ui.editingPlayerId !== null && <BuildModal />}
      <ViewBuildModal
        isOpen={ui.isViewModalOpen}
        onClose={() => ui.setUi({ isViewModalOpen: false })}
        slot={ui.selectedSlot}
        allItems={items}
      />

      {/* ADMIN UNLOCK MODAL */}
      {ui.showUnlockModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-700 backdrop-blur-md p-4 text-center">
          <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-700 w-full max-w-sm text-center space-y-6 shadow-2xl">
            <ShieldAlert size={48} className="mx-auto text-yellow-500" />
            <h3 className="text-xl font-black text-white uppercase italic tracking-widest">
              Admin Authorization
            </h3>
            <input
              type="password"
              value={ui.unlockPassword}
              onChange={(e) => ui.setUi({ unlockPassword: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center text-white outline-none focus:border-yellow-500 font-bold tracking-widest"
              placeholder="Admin Password..."
            />
            <div className="flex gap-2">
              <button
                onClick={() => ui.setUi({ showUnlockModal: false })}
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

      {/* SAVE SETUP MODAL */}
      {ui.showPasswordModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-600 backdrop-blur-md p-4 text-center">
          <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-700 w-full max-w-md space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-white text-center uppercase tracking-[0.3em] italic leading-none">
              Save Setup
            </h3>
            <div className="space-y-5">
              <div className="flex gap-2 p-1.5 bg-slate-950 rounded-3xl border border-slate-800 shadow-inner">
                <button
                  type="button"
                  disabled={ui.isSaving}
                  onClick={() => ui.setUi({ isPublic: true })}
                  className={`flex-1 py-4 rounded-[18px] font-black flex items-center justify-center gap-2 transition-all text-xs tracking-widest ${
                    ui.isPublic
                      ? "bg-yellow-600 text-black shadow-lg shadow-yellow-600/20"
                      : "text-slate-600"
                  } ${ui.isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Globe size={18} /> PUBLIC
                </button>
                <button
                  type="button"
                  disabled={ui.isSaving}
                  onClick={() => ui.setUi({ isPublic: false })}
                  className={`flex-1 py-4 rounded-[18px] font-black flex items-center justify-center gap-2 transition-all text-xs tracking-widest ${
                    !ui.isPublic
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                      : "text-slate-600"
                  } ${ui.isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Lock size={18} /> PRIVATE
                </button>
              </div>
              {!ui.isPublic && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-3 italic tracking-widest">
                    Viewer Password
                  </label>
                  <input
                    type="password"
                    value={ui.viewerPassword}
                    onChange={(e) =>
                      ui.setUi({ viewerPassword: e.target.value })
                    }
                    disabled={ui.isSaving}
                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-[20px] text-white outline-none font-bold italic tracking-widest placeholder:text-slate-800 disabled:opacity-50"
                    placeholder="Set viewer pass..."
                  />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-3 italic tracking-widest">
                  Admin Access Key
                </label>
                <div className="relative">
                  <input
                    type={ui.showAdminPass ? "text" : "password"}
                    value={ui.newPassword}
                    onChange={(e) => ui.setUi({ newPassword: e.target.value })}
                    disabled={ui.isSaving}
                    className="w-full bg-slate-950 border border-slate-800 p-4 pr-12 rounded-[20px] text-white outline-none font-bold italic tracking-widest placeholder:text-slate-800 disabled:opacity-50"
                    placeholder="Set admin password..."
                  />
                  <button
                    type="button"
                    onClick={() =>
                      ui.setUi({ showAdminPass: !ui.showAdminPass })
                    }
                    disabled={ui.isSaving}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {ui.showAdminPass ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => ui.setUi({ showPasswordModal: false })}
                disabled={ui.isSaving}
                className={`flex-1 py-4 text-slate-500 font-black uppercase text-xs tracking-widest transition-colors ${
                  ui.isSaving
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:text-slate-300"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSave}
                disabled={ui.isSaving}
                className={`flex-1 py-4 bg-blue-600 text-white font-black rounded-[22px] uppercase shadow-lg text-xs tracking-widest shadow-blue-600/20 flex items-center justify-center gap-2 ${
                  ui.isSaving
                    ? "bg-blue-600/50 cursor-not-allowed"
                    : "hover:bg-blue-500 active:scale-95 transition-all"
                }`}
              >
                {ui.isSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Saving...
                  </>
                ) : (
                  "Save Setup"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
