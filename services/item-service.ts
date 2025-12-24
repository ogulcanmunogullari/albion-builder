import { IItem } from "types";
import { fetcher } from "utils/data-fetcher";

// 1. Slot'a göre itemleri getir (Sadece kafalıklar, sadece silahlar vs.)
export const getItemsBySlot = (slot: string) => {
  // Backend endpointimiz: /api/items?slot=HEAD gibi çalışacak
  return fetcher<IItem[]>(`/items?slot=${slot}`);
};

// 2. Tüm itemleri getir
export const getAllItems = () => {
  return fetcher<IItem[]>("/items");
};

// 3. (ÖNEMLİ) Item Resmini Getir
// Bunu backend'den çekmeye gerek yok, Albion'un resmi render sunucusunu kullanıyoruz.
// Bedava ve hızlı.
export const getItemIconUrl = (uniqueName: string, quality: number = 1) => {
  return `https://render.albiononline.com/v1/item/${uniqueName}.png?quality=${quality}`;
};
