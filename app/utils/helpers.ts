import { IItem } from "../types";

export const constructItemId = (
  baseItem: IItem | undefined,
  tier: number,
  enchant: number
): string | null => {
  if (!baseItem || !baseItem.id) return null;
  const rawId = baseItem.id;
  const parts = rawId.split("_");
  // Base suffix bulma (örn: MAIN_SWORD)
  const baseIdSuffix = parts.slice(1).join("_").split("@")[0];

  let newId = `T${tier}_${baseIdSuffix}`;
  if (enchant > 0) newId += `@${enchant}`;
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
