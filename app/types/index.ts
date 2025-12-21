export interface IItem {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  tier: number;
  validTiers: number[];
  _id?: string;
  maxEnchantment: number;
  minEnchantment: number;
}

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

export interface ISlot {
  id: number; // Map işlemlerinde key hatası almamak için şart
  role: string;
  weaponId: string; // Arama ve ikonlar için gerekli
  build: IBuild;
}

export interface IComp {
  _id?: string;
  title: string;
  description?: string;
  rallyPoint?: string; // Yeni eklediğimiz alan
  swap?: string; // Yeni eklediğimiz alan
  password?: string; // Admin şifresi (Düzenleme için)
  viewerPassword?: string; // İzleyici şifresi
  isPublic: boolean; // Arama sayfasında görünürlük
  slots: ISlot[]; // Oyuncu listesi
  createdAt?: string | Date;
}
