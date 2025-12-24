"use client";

import React, { useState, useMemo, useEffect } from "react";
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

import { IPlayer, IComposition, ICategorizedItems } from "@/types";
import { getDisplayName } from "@/utils/helpers";
import { useCompositionStore } from "@/store/useCompositionStore";

// Yeni Componentler
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
  const { comp, setComp, resetComp, addPlayer, updateCompDetails } =
    useCompositionStore();

  const composition = comp.slots;
  const flattenItems = useMemo(() => Object.values(items).flat(), [items]);

  // --- LOCAL STATE ---

  const [hasAccess, setHasAccess] = useState(
    () => !initialData?.viewerPassword
  );

  const [isLocked, setIsLocked] = useState(() => hasAdminPassword);

  const [viewerPassInput, setViewerPassInput] = useState("");
  const [unlockPassword, setUnlockPassword] = useState("");

  // Header State
  const [title, setTitle] = useState(initialData?.title || "");
  const [rallyPoint, setRallyPoint] = useState(initialData?.rallyPoint || "");
  const [eventTime, setEventTime] = useState(initialData?.eventTime || "");

  // Modal State
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<IPlayer | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // --- HATA YÖNETİMİ STATE ---
  const [errors, setErrors] = useState({
    title: false,
    rally: false,
    time: false,
  });

  // Save Modal Inputs
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [viewerPassword, setViewerPassword] = useState(
    initialData?.viewerPassword || ""
  );
  const [newPassword, setNewPassword] = useState("");
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // --- useEffect State Senkronizasyonu ---
  useEffect(() => {
    if (initialData) {
      setComp(initialData);
    } else {
      resetComp();
    }
  }, [initialData, setComp, resetComp]);

  // --- ACTIONS ---
  const setComposition = (newSlots: IPlayer[]) =>
    updateCompDetails({ slots: newSlots });
  const handlePreSaveValidation = () => {
    // 1. Durumları kontrol et
    const newErrors = {
      title: !title.trim(), // Title boş mu?
      rally: !rallyPoint.trim(), // Rally boş mu?
      time: !eventTime.trim(), // Time boş mu?
    };

    // 2. Hata state'ini güncelle
    setErrors(newErrors);

    // 3. Eğer herhangi bir hata varsa işlemi durdur ve uyarı ver
    if (newErrors.title || newErrors.rally || newErrors.time) {
      // İsteğe bağlı: Kullanıcıya sesli veya toast mesajı ile de bildirilebilir
      // alert("Lütfen kırmızı alanları doldurunuz!"); // UX tercihi

      // Sayfanın en üstüne (header'a) kaydır ki hatayı görsün
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 4. Hata yoksa modalı aç ve şifreyi doldur
    setNewPassword(unlockPassword);
    setShowPasswordModal(true);
  };

  const handleDragStart = (index: number) =>
    !isLocked && setDraggedItemIndex(index);
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
  const handleDragEnd = () => setDraggedItemIndex(null);

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
      setEditingPlayerId(newPlayer.id);
      setIsModalOpen(true);
    }
  };

  // --- DÜZELTİLEN UNLOCK FONKSİYONU ---
  const handleUnlock = async () => {
    if (!initialData?._id) return;

    // Basit uzunluk kontrolü YERİNE API doğrulaması yapıyoruz.
    try {
      const res = await fetch("/api/composition/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initialData._id,
          password: unlockPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsLocked(false);
        setShowUnlockModal(false);
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

    // Header Kısmı
    let text = `# ⚔️ ${title.toUpperCase()} ⚔️\n\n`;

    // Blockquote ile detaylar
    if (rallyPoint) text += `📍 **RALLY:** ${rallyPoint}`;
    if (eventTime && rallyPoint) text += `    |    `;
    if (eventTime) text += ` ⏰ **TIME:** ${eventTime} UTC `;
    text += `\n`;
    // Link ve Şifre
    text += `> 🔗 **LINK:** ${
      initialData?._id ? `<${compUrl}>` : "Not Saved"
    }\n`;

    if (viewerPassword) text += `> 🔑 **PASS:** \`${viewerPassword}\`\n`;

    text += `\n**📋 Build List:**\n\n`;
    // Not: ```md bloğunu kaldırdım çünkü resimdeki gibi Bold ve Emoji görünmesi için düz metin lazım.

    composition.forEach((slot, index) => {
      const num = (index + 1).toString().padStart(2, "0");
      const icon = slot.roleIcon || "👤";

      const mainWp = getDisplayName(slot.weaponId, flattenItems) || "Any";
      const swapWp = slot.swapBuild?.mainHand
        ? getDisplayName(slot.swapBuild.mainHand, flattenItems)
        : null;

      // Temel Yapı: `01` 🛡️ **ROLE**
      text += `\`${num}\` ${icon} **${slot.role.toUpperCase()}**`;

      // --- İSTEDİĞİN MANTIK ---
      if (swapWp) {
        // Swap varsa: "Main:" ve "Swap:" ayrı ayrı belirtilir
        text += ` - **Main:** ${mainWp}  **Swap:** ${swapWp}`;
      } else {
        // Swap yoksa: Sadece silah adı yazar, "Main:" yazmaz
        text += ` - ${mainWp}`;
      }

      // İsim alanı
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
    if (isSaving) return;
    setIsSaving(true);

    const isNewRecord = !initialData?._id;

    // YETKİLENDİRME ŞİFRESİ
    const passwordPayload = isNewRecord ? newPassword : unlockPassword;

    try {
      const res = await fetch("/api/composition", {
        method: isNewRecord ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initialData?._id,
          title,
          rallyPoint,
          eventTime,
          isPublic,
          viewerPassword: isPublic ? "" : viewerPassword,

          // 1. Yetki Kanıtı
          password: passwordPayload,

          // 2. KAYDEDİLECEK ŞİFRE (DÜZELTİLDİ)
          // Artık undefined kontrolü yapmıyoruz.
          // Kullanıcı sildiyse "", yazdıysa "yenişifre" gidiyor.
          nextPassword: newPassword,

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
          // Sayfa yenilendiğinde yeni şifre (veya şifresizlik) geçerli olacak
          window.location.reload();
        }
      } else {
        alert(`❌ Error: ${data.message || "Authorization failed"}`);
        setIsSaving(false);
      }
    } catch {
      alert("Save failed!");
      setIsSaving(false);
    }
  };

  // --- VIEWER LOCK SCREEN ---
  if (!hasAccess && initialData?.viewerPassword) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-500 p-4 backdrop-blur-md">
        <div className="max-w-sm w-full bg-slate-900 border border-slate-800 p-8 rounded-[40px] text-center space-y-6 shadow-2xl">
          <Lock size={40} className="mx-auto text-red-500" />
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">
            Viewer Access Required
          </h2>
          <input
            type="password"
            value={viewerPassInput}
            onChange={(e) => setViewerPassInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center text-white outline-none focus:border-red-500 font-bold"
            placeholder="Password..."
          />
          <button
            onClick={() =>
              viewerPassInput === initialData?.viewerPassword
                ? setHasAccess(true)
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-8 pb-20 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <CompHeader
          title={title}
          setTitle={(val) => {
            setTitle(val);
            if (errors.title) setErrors({ ...errors, title: false }); // Yazmaya başlayınca kırmızılığı kaldır
          }}
          rallyPoint={rallyPoint}
          setRallyPoint={(val) => {
            setRallyPoint(val);
            if (errors.rally) setErrors({ ...errors, rally: false });
          }}
          eventTime={eventTime}
          setEventTime={(val) => {
            setEventTime(val);
            if (errors.time) setErrors({ ...errors, time: false });
          }}
          isLocked={isLocked}
          errors={errors}
        />

        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          {/* Action Bar */}
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
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2.5 rounded-xl font-black text-[11px] flex items-center gap-2 uppercase italic shadow-lg shadow-indigo-600/30 transition-all active:scale-95 border border-indigo-400/20 tracking-widest"
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
                    onClick={handlePreSaveValidation} // <--- ARTIK DİREKT MODAL AÇMIYOR, VALIDATION'A GİDİYOR
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
                isLocked={isLocked}
                flattenItems={flattenItems}
                draggedItemIndex={draggedItemIndex}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onEdit={(id) => {
                  setEditingPlayerId(id);
                  setIsModalOpen(true);
                }}
                onView={(s) => {
                  setSelectedSlot(s);
                  setIsViewModalOpen(true);
                }}
                onDelete={(id) => {
                  const newComp = composition.filter((p) => p.id !== id);
                  setComposition(newComp);
                }}
                onToggleSwap={toggleSwap}
                onDuplicate={handleDuplicateSlot}
              />
            ))}
          </div>

          {!isLocked && (
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
      {editingPlayerId !== null && (
        <BuildModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPlayerId(null);
          }}
          playerId={editingPlayerId}
          readOnly={isLocked}
        />
      )}
      <ViewBuildModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        slot={selectedSlot}
        allItems={items}
      />

      {/* ADMIN UNLOCK MODAL */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-700 backdrop-blur-md p-4 text-center">
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

      {/* SAVE SETUP MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-600 backdrop-blur-md p-4 text-center">
          <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-700 w-full max-w-md space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-white text-center uppercase tracking-[0.3em] italic leading-none">
              Save Setup
            </h3>
            <div className="space-y-5">
              <div className="flex gap-2 p-1.5 bg-slate-950 rounded-3xl border border-slate-800 shadow-inner">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsPublic(true)}
                  className={`flex-1 py-4 rounded-[18px] font-black flex items-center justify-center gap-2 transition-all text-xs tracking-widest ${
                    isPublic
                      ? "bg-yellow-600 text-black shadow-lg shadow-yellow-600/20"
                      : "text-slate-600"
                  } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Globe size={18} /> PUBLIC
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsPublic(false)}
                  className={`flex-1 py-4 rounded-[18px] font-black flex items-center justify-center gap-2 transition-all text-xs tracking-widest ${
                    !isPublic
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                      : "text-slate-600"
                  } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
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
                    disabled={isSaving}
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
                    type={showAdminPass ? "text" : "password"} // Type değişiyor
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isSaving}
                    // pr-12 ekledik ki yazı ikona binmesin
                    className="w-full bg-slate-950 border border-slate-800 p-4 pr-12 rounded-[20px] text-white outline-none font-bold italic tracking-widest placeholder:text-slate-800 disabled:opacity-50"
                    placeholder="Set admin password..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    disabled={isSaving}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showAdminPass ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                disabled={isSaving}
                className={`flex-1 py-4 text-slate-500 font-black uppercase text-xs tracking-widest transition-colors ${
                  isSaving
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:text-slate-300"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSave}
                disabled={isSaving}
                className={`flex-1 py-4 bg-blue-600 text-white font-black rounded-[22px] uppercase shadow-lg text-xs tracking-widest shadow-blue-600/20 flex items-center justify-center gap-2 ${
                  isSaving
                    ? "bg-blue-600/50 cursor-not-allowed"
                    : "hover:bg-blue-500 active:scale-95 transition-all"
                }`}
              >
                {isSaving ? (
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
