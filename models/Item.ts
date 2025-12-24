import mongoose, { Schema, Document, Model } from "mongoose";

// Interface güncellemesi
export interface IItemDoc extends Document {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  tier: number;
  validTiers: number[];
  maxEnchantment: number;
  minEnchantment: number;
}

// Şema güncellemesi
const ItemSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String },
  tier: { type: Number, default: 8 },
  validTiers: { type: [Number], default: [] },

  // Sadece Min ve Max Enchantment kaldı
  maxEnchantment: { type: Number, default: 0 },
  minEnchantment: { type: Number, default: 0 },
});

// Singleton Model
const Item: Model<IItemDoc> =
  mongoose.models.Item || mongoose.model<IItemDoc>("Item", ItemSchema);

export default Item;
