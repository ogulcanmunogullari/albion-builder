import mongoose, { Schema, Document, model, models } from "mongoose";
import { IPlayer } from "@/types";

// Build Şeması
const BuildSchema = new Schema(
  {
    mainHand: { type: String, default: "" },
    offHand: { type: String, default: "" },
    head: { type: String, default: "" },
    armor: { type: String, default: "" },
    shoes: { type: String, default: "" },
    cape: { type: String, default: "" },
    mount: { type: String, default: "" },
    food: { type: String, default: "" },
    potion: { type: String, default: "" },
  },
  { _id: false }
);

// Slot (Player) Şeması
const PlayerSchema = new Schema(
  {
    id: Number,
    role: { type: String, default: "New Role" },
    roleIcon: { type: String, default: "👤" },
    weaponId: { type: String, default: "" },
    build: { type: BuildSchema, default: () => ({}) },
    swapBuild: { type: BuildSchema, default: null },
    isSwapActive: { type: Boolean, default: false },
  },
  { _id: false }
);

const CompSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    rallyPoint: String,

    // VERİTABANINDAKİ ORİJİNAL İSİM KORUNDU
    swap: { type: String },

    isPublic: { type: Boolean, default: true },
    password: { type: String, select: false },
    viewerPassword: { type: String, default: "" },
    slots: [PlayerSchema],
  },
  {
    timestamps: true, // createdAt, updatedAt otomatik gelir
  }
);

// TypeScript Arayüzü
export interface ICompDoc extends Document {
  title: string;
  description?: string;
  rallyPoint?: string;
  swap?: string; // DB'deki adı
  isPublic: boolean;
  password?: string;
  viewerPassword?: string;
  slots: IPlayer[];
  createdAt: Date;
  updatedAt: Date;
}

const Comp = models.Comp || model<ICompDoc>("Comp", CompSchema);

export default Comp;
