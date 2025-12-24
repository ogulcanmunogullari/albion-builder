import { NextRequest, NextResponse } from "next/server";
import mongoose, { Schema, model, models } from "mongoose";

// --- Veritabanı Bağlantısı ---
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Lütfen .env dosyanızda MONGODB_URI tanımlayın.");
}

let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI!, { bufferCommands: false })
      .then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// --- Şema (update-db.js ile aynı) ---
const ItemSchema = new Schema({
  id: String,
  name: String,
  category: String,
  subCategory: String,
  tier: { type: Number, default: 8 },
  validTiers: { type: [Number], default: [] },
  maxEnchantment: { type: Number, default: 0 },
  minEnchantment: { type: Number, default: 0 },
});

const Item = models.Item || model("Item", ItemSchema);

// --- API Handler ---
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category"); // Örn: 'mainHand', 'mount', 'head'
    const search = searchParams.get("search"); // Örn: 'Bloodletter'

    const query: any = {};

    // EĞER Frontend bir kategori gönderdiyse onu filtreye ekle
    // Göndermezse hepsini çeker (senin yaşadığın sorun buydu)
    if (category) {
      query.category = category;
    }

    // Arama kutusu için filtre
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Veritabanından sadece o kategoriye ait itemleri çek
    const items = await Item.find(query).sort({ subCategory: 1, name: 1 });

    return NextResponse.json(items);
  } catch (error: any) {
    console.error("API Hatası:", error);
    return NextResponse.json({ error: "Veri çekilemedi" }, { status: 500 });
  }
}
