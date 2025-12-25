import { create } from "zustand";
import { IComposition, IPlayer, IBuild } from "@/types";

// Yeni bir oyuncu eklendiğinde itemleri boş gelsin
const initialBuild: IBuild = {
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

const DEFAULT_COMPOSITION: IComposition = {
  _id: "",
  title: "",
  password: "",
  viewerPassword: "",
  isPublic: true,
  rallyPoint: "",
  eventTime: "",
  slots: [], // Burası senin varsayılan boş slotların olmalı
};

interface CompositionState {
  // Store'un tuttuğu ana veri: Bütün Kompozisyon
  comp: IComposition;

  // --- Eylemler (Actions) --- //

  // 1. Veriyi Yükle (Veritabanından gelince store'a atar)
  setComp: (comp: IComposition) => void;

  // 2. Kompozisyon Detaylarını Güncelle (Başlık, Açıklama, Saat, Toplanma Yeri)
  updateCompDetails: (details: Partial<IComposition>) => void;

  // 3. Yeni Oyuncu (Slot) Ekle
  addPlayer: () => void;

  // 4. Oyuncu (Slot) Sil
  removePlayer: (playerId: number) => void;

  // 5. Oyuncu Rolünü Güncelle (Tank, Healer vb.)
  updatePlayerRole: (playerId: number, role: string, roleIcon?: string) => void;

  // 6. Oyuncunun Eşyasını Güncelle
  setPlayerItem: (
    playerId: number,
    isSwap: boolean,
    part: keyof IBuild,
    itemId: string
  ) => void;
  resetComp: () => void;
}

// 1. Store'un Tipi (Interface)
interface CompositionUiState {
  // --- SENİN ARADIĞIN DEĞİŞKENLER BURADA ---
  hasAccess: boolean;
  isLocked: boolean; // <--- Burada
  viewerPassInput: string;
  unlockPassword: string;

  title: string;
  rallyPoint: string;
  eventTime: string;

  isModalOpen: boolean;
  isViewModalOpen: boolean;
  showUnlockModal: boolean;
  showPasswordModal: boolean;
  editingPlayerId: number | null;
  selectedSlot: IPlayer | null;

  errors: { title: boolean; rally: boolean; time: boolean };

  isPublic: boolean;
  viewerPassword: string;
  newPassword: string;
  showAdminPass: boolean;
  isSaving: boolean;

  draggedItemIndex: number | null;

  // --- ACTIONS ---
  setUi: (partial: Partial<CompositionUiState>) => void;
  initializeUi: (data: IComposition | undefined, hasAdminPass: boolean) => void;
  resetUi: () => void;
}

export const useCompositionStore = create<CompositionState>((set) => ({
  // Başlangıç State'i
  comp: DEFAULT_COMPOSITION,
  setComp: (comp) => set({ comp }),
  updateCompDetails: (details) =>
    set((state) => ({
      comp: { ...state.comp, ...details },
    })),
  addPlayer: () =>
    set((state) => {
      const newPlayer: IPlayer = {
        id: Date.now(), // Unique ID
        role: "",
        weaponId: "",
        build: { ...initialBuild },
        swapBuild: { ...initialBuild },
        isSwapActive: false,
      };
      return {
        comp: { ...state.comp, slots: [...state.comp.slots, newPlayer] },
      };
    }),
  removePlayer: (playerId) =>
    set((state) => ({
      comp: {
        ...state.comp,
        slots: state.comp.slots.filter((p) => p.id !== playerId),
      },
    })),
  updatePlayerRole: (playerId, role, roleIcon) =>
    set((state) => {
      const newSlots = state.comp.slots.map((player) => {
        if (player.id === playerId) {
          return { ...player, role, ...(roleIcon && { roleIcon }) };
        }
        return player;
      });
      return { comp: { ...state.comp, slots: newSlots } };
    }),
  setPlayerItem: (playerId, isSwap, part, itemId) =>
    set((state) => {
      const newSlots = state.comp.slots.map((player) => {
        // İlgili oyuncuyu bul
        if (player.id !== playerId) return player;

        // Player objesini kopyala (Immutability)
        const updatedPlayer = { ...player };

        if (isSwap) {
          // Swap build güncelle
          updatedPlayer.swapBuild = {
            ...(updatedPlayer.swapBuild || initialBuild),
            [part]: itemId,
          };
        } else {
          // Ana build güncelle
          updatedPlayer.build = {
            ...updatedPlayer.build,
            [part]: itemId,
          };

          // Eğer Main Hand değişirse, oyuncunun ana silah ikonunu (weaponId) da güncelle
          if (part === "mainHand") {
            updatedPlayer.weaponId = itemId;
          }
        }
        return updatedPlayer;
      });

      return { comp: { ...state.comp, slots: newSlots } };
    }),
  resetComp: () => set({ comp: DEFAULT_COMPOSITION }),
}));
