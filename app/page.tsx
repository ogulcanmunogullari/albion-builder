import HomeClient from "@/HomeClient";
import mongoose from "mongoose";
import Item, { IItemDoc } from "@/models/Item";
import { ICategorizedItems, IItem } from "@/types";

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  if (!process.env.MONGODB_URI) throw new Error("Mongo URI yok");
  await mongoose.connect(process.env.MONGODB_URI);
};

export default async function Page() {
  let itemsFormatted: ICategorizedItems = {
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

  try {
    await connectDB();
    const rawItems = await Item.find({}).lean<IItemDoc[]>();

    if (rawItems && rawItems.length > 0) {
      const formatItem = (i: IItemDoc): IItem => ({
        id: i.id,
        name: i.name,
        category: i.category,
        tier: i.tier,
        enchantment: i.enchantment,
        validTiers: i.validTiers,
        _id: i._id.toString(),
      });

      itemsFormatted = {
        mainHand: rawItems
          .filter((i) => i.category === "mainHand")
          .map(formatItem),
        offHand: rawItems
          .filter((i) => i.category === "offHand")
          .map(formatItem),
        head: rawItems.filter((i) => i.category === "head").map(formatItem),
        armor: rawItems.filter((i) => i.category === "armor").map(formatItem),
        shoes: rawItems.filter((i) => i.category === "shoes").map(formatItem),
        cape: rawItems.filter((i) => i.category === "cape").map(formatItem),
        mount: rawItems.filter((i) => i.category === "mount").map(formatItem),
        food: rawItems.filter((i) => i.category === "food").map(formatItem),
        potion: rawItems.filter((i) => i.category === "potion").map(formatItem),
      };
    }
  } catch (error) {
    console.error("Veri çekme hatası:", error);
  }

  return <HomeClient items={itemsFormatted} />;
}
