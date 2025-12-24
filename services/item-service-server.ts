// services/item-service-server.ts
import { connectDB } from "@/lib/db";
import Item, { IItemDoc } from "@/models/Item";
import { ICategorizedItems, IItem } from "@/types";

/**
 * Bu fonksiyon doğrudan veritabanına bağlanır.
 * Sadece Server Component'ler (page.tsx vb.) içinde kullanılmalıdır.
 */
export async function getItemsDirectly(): Promise<ICategorizedItems> {
  try {
    await connectDB();

    // Lean kullanarak performansı artırıyoruz (saf JSON döner)
    const rawItems = await Item.find({}).lean<IItemDoc[]>();

    // Helper: DB formatını UI formatına çevir
    const formatItem = (i: IItemDoc): IItem => ({
      id: i.id,
      name: i.name,
      category: i.category,
      subCategory: i.subCategory,
      tier: i.tier,
      validTiers: i.validTiers,
      _id: i._id.toString(), // ObjectId'yi string'e çeviriyoruz
      maxEnchantment: i.maxEnchantment || 0,
      minEnchantment: i.minEnchantment || 0,
    });

    // Kategorilere ayırma işlemi
    // (Bunu veritabanı sorgusuyla değil, bellekte yaparak DB yükünü azaltıyoruz)
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
    };
  } catch (error) {
    console.error("❌ DB Fetch Error:", error);
    // Hata durumunda sayfanın çökmemesi için boş yapı dönüyoruz
    return {
      mainHand: [],
      offHand: [],
      head: [],
      armor: [],
      shoes: [],
      cape: [],
      mount: [],
      food: [],
      potion: [],
    };
  }
}
