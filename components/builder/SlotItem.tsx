import React, { useState } from "react";
import { GripVertical, RefreshCw, Edit, Eye, Trash2, Copy } from "lucide-react";
import { IItem, IPlayer } from "@/types";
import { getDisplayName } from "@/utils/helpers";
import SmallItemIcon from "@/components/SmallItemIcon";
import { useCompositionStore } from "@/store/useCompositionStore";
import { DISCORD_ROLE_ICONS } from "@/constants/icons";

interface SlotItemProps {
  slot: IPlayer;
  index: number;
  isLocked: boolean;
  flattenItems: IItem[];
  draggedItemIndex: number | null;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onEdit: (id: number) => void;
  onView: (slot: IPlayer) => void;
  onDelete: (id: number) => void;
  onToggleSwap: (index: number) => void;
  onDuplicate: (index: number) => void; // YENİ: Duplicate fonksiyonu
}

export default function SlotItem({
  slot,
  index,
  isLocked,
  flattenItems,
  draggedItemIndex,
  onDragStart,
  onDragOver,
  onDragEnd,
  onEdit,
  onView,
  onDelete,
  onToggleSwap,
  onDuplicate, // Prop olarak alıyoruz
}: SlotItemProps) {
  const { updatePlayerRole } = useCompositionStore();
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  return (
    <div
      draggable={!isLocked}
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className={`p-4 transition-all group space-y-3 relative ${
        draggedItemIndex === index
          ? "opacity-20 bg-yellow-500/5 scale-[0.98]"
          : "hover:bg-slate-800/10"
      }`}
    >
      <div className="flex flex-col lg:flex-row items-center gap-4">
        {/* DRAG HANDLE */}
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

        {/* ROLE & ICON */}
        <div className="flex gap-1 items-center bg-slate-950 border border-slate-700 rounded-xl p-1 shadow-inner shrink-0 group-hover:border-slate-500 transition-colors">
          <div className="relative">
            <button
              type="button"
              disabled={isLocked}
              onClick={(e) => {
                e.stopPropagation();
                setIsIconPickerOpen(!isIconPickerOpen);
              }}
              className="bg-slate-800 text-lg px-2 py-1 rounded-lg hover:bg-slate-700 transition shadow flex items-center justify-center min-w-11 h-9 border border-slate-700 active:scale-95"
            >
              {slot.roleIcon || "👤"}
            </button>
            {isIconPickerOpen && (
              <>
                <div
                  className="fixed inset-0 z-200 bg-black/60 backdrop-blur-sm"
                  onClick={() => setIsIconPickerOpen(false)}
                />
                <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-210 bg-slate-900 border border-slate-700 p-4 rounded-4xl shadow-2xl w-[90%] max-w-100">
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-[60vh] overflow-y-auto p-1">
                    {DISCORD_ROLE_ICONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          updatePlayerRole(slot.id, slot.role, emoji);
                          setIsIconPickerOpen(false);
                        }}
                        className="text-2xl p-2 hover:bg-slate-800 rounded-2xl transition-all hover:scale-125"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <input
            value={slot.role}
            disabled={isLocked}
            onChange={(e) => updatePlayerRole(slot.id, e.target.value)}
            placeholder="ROLE..."
            className="bg-transparent text-xs font-black text-blue-400 w-32 outline-none uppercase italic px-2 placeholder:text-slate-800"
          />
        </div>

        {/* BUILD ICONS */}
        <div
          className="flex gap-1 flex-wrap cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (!isLocked) onEdit(slot.id);
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
          {getDisplayName(slot.weaponId, flattenItems) || "Empty Unit Slot"}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleSwap(index)}
            className={`p-2 rounded-lg transition shadow-sm ${
              slot.isSwapActive
                ? "bg-yellow-500 text-black"
                : "text-slate-500 hover:text-white bg-slate-800/50"
            }`}
          >
            <RefreshCw size={20} />
          </button>

          {!isLocked && (
            <>
              {/* DUPLICATE BUTTON (YENİ EKLENDİ) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(index);
                }}
                className="bg-purple-600/10 text-purple-500 p-2 rounded-lg border border-purple-600/20 hover:bg-purple-600 hover:text-white transition shadow-sm"
                title="Duplicate Role"
              >
                <Copy size={20} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(slot.id);
                }}
                className="bg-blue-600/10 text-blue-500 p-2 rounded-lg border border-blue-600/20 hover:bg-blue-600 hover:text-white transition shadow-sm"
              >
                <Edit size={20} />
              </button>
            </>
          )}

          <button
            onClick={() => onView(slot)}
            className="p-2 text-slate-500 hover:text-white transition"
          >
            <Eye size={20} />
          </button>

          {!isLocked && (
            <button
              onClick={() => onDelete(slot.id)}
              className="p-2 text-slate-600 hover:text-red-500 transition hover:bg-red-500/5 rounded-lg"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      {/* SWAP BUILD AREA */}
      {slot.isSwapActive && (
        <div className="ml-16 p-4 bg-yellow-500/5 border-l-2 border-yellow-500/30 rounded-r-2xl flex flex-wrap items-center gap-4">
          <span className="text-[10px] font-black text-yellow-500 uppercase italic tracking-widest leading-none">
            🔄 Swap:
          </span>
          <div
            className="flex gap-1 flex-wrap cursor-pointer"
            onClick={() => !isLocked && onEdit(slot.id)}
          >
            {slot.swapBuild ? (
              Object.entries(slot.swapBuild)
                .filter(
                  ([key, itemId]) => itemId && itemId !== "" && key !== "_id"
                )
                .map(([key, itemId]) => (
                  <SmallItemIcon
                    key={key}
                    id={itemId as string}
                    name={getDisplayName(itemId as string, flattenItems)}
                  />
                ))
            ) : (
              <div className="text-[10px] text-yellow-500/30 font-black uppercase italic px-4 py-2 border border-dashed border-yellow-500/10 rounded-lg tracking-[0.2em]">
                Add Swap Build
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
