import mongoose from "mongoose";
import Item, { IItemDoc } from "@/models/Item";
import HomeClient from "@/HomeClient";
import { IItem, ICategorizedItems } from "@/types";

// DB Bağlantısı - Burayı eklemeyi unutma!
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  if (!process.env.MONGODB_URI) throw new Error("Mongo URI missing");
  await mongoose.connect(process.env.MONGODB_URI);
};

async function getItems() {
  try {
    await connectDB();
    const rawItems = await Item.find({}).lean<IItemDoc[]>();

    const formatItem = (i: IItemDoc): IItem => ({
      id: i.id,
      name: i.name,
      category: i.category,
      subCategory: i.subCategory,
      tier: i.tier,
      validTiers: i.validTiers,
      _id: i._id.toString(),
      maxEnchantment: i.maxEnchantment || 0,
      minEnchantment: i.minEnchantment || 0,
    });

    return {
      mainHand: rawItems
        .filter((i) => i.category === "mainHand")
        .map(formatItem),
      offHand: rawItems.filter((i) => i.category === "offHand").map(formatItem),
      head: rawItems.filter((i) => i.category === "head").map(formatItem),
      armor: rawItems.filter((i) => i.category === "armor").map(formatItem),
      shoes: rawItems.filter((i) => i.category === "shoes").map(formatItem),
      cape: rawItems.filter((i) => i.category === "cape").map(formatItem),
      mount: rawItems.filter((i) => i.category === "mount").map(formatItem),
      food: rawItems.filter((i) => i.category === "food").map(formatItem),
      potion: rawItems.filter((i) => i.category === "potion").map(formatItem),
    } as ICategorizedItems;
  } catch (error) {
    console.error("Fetch Error:", error);
    return {} as ICategorizedItems;
  }
}

export default async function CreatePage() {
  // Verileri sunucu tarafında çekiyoruz
  const itemsFormatted = await getItems();

  // HomeClient'a sadece gerekli verileri gönderiyoruz.
  // initialData gönderilmediği için sistem otomatik olarak "Yeni Kayıt" modunda açılacaktır.
  return (
    <main className="min-h-screen bg-slate-950">
      <HomeClient items={itemsFormatted} />
    </main>
  );
}
