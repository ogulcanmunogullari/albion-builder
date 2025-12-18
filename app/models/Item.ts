import mongoose, { Schema, Document, Model } from "mongoose";

// Interface ile Mongoose Document birleşimi
export interface IItemDoc extends Document {
  id: string;
  name: string;
  category: string;
  tier: number;
  enchantment: number;
  validTiers: number[];
}

const ItemSchema = new Schema<IItemDoc>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  tier: { type: Number, default: 8 },
  enchantment: { type: Number, default: 0 },
  validTiers: { type: [Number], default: [] },
});

// "models.Item" kontrolü Next.js hot-reload için şarttır
const Item: Model<IItemDoc> =
  mongoose.models.Item || mongoose.model<IItemDoc>("Item", ItemSchema);
export default Item;
