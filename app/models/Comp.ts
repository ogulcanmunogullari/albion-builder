import mongoose, { Schema, Document, Model } from "mongoose";
import { ISlot } from "@/types";

interface ICompDoc extends Document {
  title: string;
  description?: string;
  rallyPoint?: string;
  swap?: string;
  password?: string; // Admin/Edit Şifresi
  viewerPassword?: string; // İZLEYİCİ ŞİFRESİ
  isPublic: boolean; // ARAMADA GÖRÜNSÜN MÜ?
  createdAt: Date;
  slots: ISlot[];
}

const CompSchema = new Schema<ICompDoc>({
  title: { type: String, required: true },
  description: String,
  rallyPoint: String,
  swap: String,
  password: { type: String }, // Admin şifresi burada saklanır
  viewerPassword: { type: String, default: "" },
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  slots: [
    {
      id: Number,
      role: String,
      weaponId: String,
      build: {
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
    },
  ],
});

const Comp: Model<ICompDoc> =
  mongoose.models.Comp || mongoose.model<ICompDoc>("Comp", CompSchema);
export default Comp;
