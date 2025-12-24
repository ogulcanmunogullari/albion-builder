import { IItem } from "types";

export const constructItemId = (item: any, tier: number, enchant: number) => {
  if (!item || !item.id) return null;

  // --- 1. UNIQUE ITEM KORUMASI ---
  // ID "UNIQUE" kelimesi ile başlıyorsa (Binekler, Sezon Ödülleri vb.)
  // Hiçbir Tier veya Enchant işlemi yapma. Veritabanındaki ID neyse onu döndür.
  if (item.id.startsWith("UNIQUE")) {
    return item.id;
  }

  // --- 2. STANDART ITEMLER (Silah, Zırh, Normal Binekler) ---
  // Sadece T4, T5 gibi standart itemler için Tier hesapla.

  // Halihazırda Tier bilgisi varsa temizle (T4_MAIN... -> MAIN...)
  const cleanId = item.id.replace(/^T\d+_/, "");

  // Yeni ID oluştur (Seçilen Tier ile)
  let newId = `T${tier}_${cleanId}`;

  // Enchant ekle (Varsa)
  if (enchant > 0) {
    // Eğer ID zaten @ ile bitiyorsa (nadir), temizle
    if (newId.includes("@")) {
      newId = newId.split("@")[0];
    }
    newId += `@${enchant}`;
  }

  return newId;
};

export const getDisplayName = (
  fullId: string,
  allItemsFlat: IItem[]
): string => {
  if (!fullId) return "None";
  const parts = fullId.split("_");
  const baseSuffix = parts.slice(1).join("_").split("@")[0];

  // İsmi bulmak için suffix eşleşmesi yapıyoruz
  const found = allItemsFlat.find((i) => i.id.includes(baseSuffix));
  return found ? found.name : fullId;
};
