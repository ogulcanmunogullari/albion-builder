// types/index.ts

export interface IItem {
  id: string; // Albion ID'si (Örn: "T4_MAIN_SWORD")
  name: string; // Görünür Ad (Örn: "Broadsword")
  category: string; // weapon, armor vs.
  subCategory?: string;
  tier: number;
  validTiers: number[];

  _id?: string; // MongoDB ID'si (Backend'den gelirse)
  maxEnchantment: number;
  minEnchantment: number;
}

// Kategorilenmiş item listesi (Modal içinde filtreleme yaparken kullanılır)
export interface ICategorizedItems {
  mainHand: IItem[];
  offHand: IItem[];
  head: IItem[];
  armor: IItem[];
  shoes: IItem[];
  cape: IItem[];
  mount: IItem[];
  food: IItem[];
  potion: IItem[];
}

// Bir oyuncunun üzerindeki eşyaların ID'leri
export interface IBuild {
  mainHand: string;
  offHand: string;
  head: string;
  armor: string;
  shoes: string;
  cape: string;
  mount: string;
  food: string;
  potion: string;
}

// Eskiden "ISlot" idi, şimdi "IPlayer" oldu (Çok daha mantıklı)
export interface IPlayer {
  id: number; // Slot'un sırasını veya benzersizliğini tutmak için timestamp
  role: string; // "Tank", "Healer", "DPS" vs.
  roleIcon?: string; // "🛡️", "💊" vs.
  weaponId: string; // Kartın üzerinde görünen ana silah resmi için
  build: IBuild; // Ana Build
  swapBuild?: IBuild; // Yedek (Swap) Build
  isSwapActive?: boolean; // Şu an swap mı gösteriliyor?
}

// Eskiden "IComp" idi, şimdi tam isim "IComposition"
export interface IComposition {
  _id?: string; // MongoDB ID
  title: string; // "ZVZ Party"
  description?: string;
  rallyPoint?: string; // "Martlock Portal"
  eventTime?: string; // "Swap zorunludur" notu vs.
  password?: string; // Düzenleme şifresi
  viewerPassword?: string; // Sadece izleme şifresi
  isPublic: boolean;
  slots: IPlayer[]; // Oyuncu listesi
  createdAt?: string | Date;
}

export interface ICompUiState {
  // Access & Lock
  hasAccess: boolean;
  isLocked: boolean;
  viewerPassInput: string;
  unlockPassword: string;

  // Header Inputs
  title: string;
  rallyPoint: string;
  eventTime: string;

  // Modals & Selection
  isModalOpen: boolean;
  isViewModalOpen: boolean;
  showUnlockModal: boolean;
  showPasswordModal: boolean;
  editingPlayerId: number | null;
  selectedSlot: IPlayer | null;

  // Errors
  errors: { title: boolean; rally: boolean; time: boolean };

  // Save Modal Inputs
  isPublic: boolean;
  viewerPassword: string; // Kayıt sırasındaki input
  newPassword: string; // Admin şifresi (yeni veya mevcut)
  showAdminPass: boolean;
  isSaving: boolean;

  // Drag & Drop
  draggedItemIndex: number | null;

  // Actions
  setUi: (partial: Partial<ICompUiState>) => void;
  initializeUi: (data: IComposition | undefined, hasAdminPass: boolean) => void;
  resetUi: () => void;
}
