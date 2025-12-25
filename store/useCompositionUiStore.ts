import { create } from "zustand";
import { ICompUiState } from "@/types";

const initialState = {
  hasAccess: false,
  isLocked: false,
  viewerPassInput: "",
  unlockPassword: "",
  title: "",
  rallyPoint: "",
  eventTime: "",
  isModalOpen: false,
  isViewModalOpen: false,
  showUnlockModal: false,
  showPasswordModal: false,
  editingPlayerId: null,
  selectedSlot: null,
  errors: { title: false, rally: false, time: false },
  isPublic: true,
  viewerPassword: "",
  newPassword: "",
  showAdminPass: false,
  isSaving: false,
  draggedItemIndex: null,
};

export const useCompositionUiStore = create<ICompUiState>((set) => ({
  ...initialState,

  setUi: (partial) => set((state) => ({ ...state, ...partial })),

  initializeUi: (data, hasAdminPass) => {
    set({
      ...initialState, // Önce temizle
      hasAccess: !data?.viewerPassword,
      isLocked: hasAdminPass,
      title: data?.title || "",
      rallyPoint: data?.rallyPoint || "",
      eventTime: data?.eventTime || "",
      isPublic: data?.isPublic ?? true,
      viewerPassword: data?.viewerPassword || "",
    });
  },

  resetUi: () => set(initialState),
}));
