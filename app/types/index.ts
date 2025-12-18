// types.ts

export interface IItem {
  id: string;
  name: string;
  category: string;
  tier: number;
  enchantment?: number;
  validTiers?: number[];
  _id?: string;
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
  id: number;
  role: string;
  weaponId: string;
  build: IBuild;
}

export interface IComp {
  _id?: string;
  title: string;
  description: string;
  rallyPoint?: string;
  swap?: string;
  password?: string;
  hasPassword?: boolean;
  slots: ISlot[];
  createdAt?: string;
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
