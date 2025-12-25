import { create } from "zustand";
import { IItem } from "@/types";
type FilterKeys = "searchTerm" | "selectedTier" | "selectedEnchant";
interface ItemUiState {
  // Data
  slotItems: IItem[];
  isLoading: boolean;

  // Filters
  searchTerm: string;
  selectedTier: number;
  selectedEnchant: number;

  // Actions
  setFilter: (key: FilterKeys, value: string | number) => void;
  fetchItems: (category: string) => Promise<void>;
  resetUi: () => void;
}

export const useItemUiStore = create<ItemUiState>((set) => ({
  slotItems: [],
  isLoading: false,
  searchTerm: "",
  selectedTier: 8,
  selectedEnchant: 0,

  // Tek bir fonksiyonla tüm filtreleri güncelleme yeteneği
  setFilter: (key, value) => set((state) => ({ ...state, [key]: value })),

  // API İsteği (Artık component içinde değil burada)
  fetchItems: async (category) => {
    set({ isLoading: true, slotItems: [] }); // Yükleniyor...
    try {
      const response = await fetch(`/api/items?category=${category}`);
      if (!response.ok) throw new Error("Veri çekilemedi");
      const data = await response.json();
      set({ slotItems: data });
    } catch (error) {
      console.error(error);
      set({ slotItems: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  // Modal kapanınca veya slot değişince temizlik
  resetUi: () =>
    set({
      searchTerm: "",
      slotItems: [],
      isLoading: false,
    }),
}));
