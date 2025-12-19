import mongoose from "mongoose";
import Comp from "@/app/models/Comp";
import Item, { IItemDoc } from "@/app/models/Item";
import HomeClient from "@/app/HomeClient";
import { IItem, ICategorizedItems } from "../../types";

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  if (!process.env.MONGODB_URI) throw new Error("Mongo URI missing");
  await mongoose.connect(process.env.MONGODB_URI);
};

async function getData(compId: string) {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(compId)) return null;

    const compData = await Comp.findById(compId).lean();
    if (!compData) return null;

    const rawItems = await Item.find({}).lean<IItemDoc[]>();

    const formatItem = (i: IItemDoc): IItem => ({
      id: i.id,
      name: i.name,
      category: i.category,
      tier: i.tier,
      enchantment: i.enchantment,
      validTiers: i.validTiers,
      _id: i._id.toString(),
    });

    const itemsFormatted: ICategorizedItems = {
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

    const hasPassword = !!compData.password && compData.password.length > 0;

    const compClean = {
      ...compData,
      _id: compData._id.toString(),
      password: "",
      hasPassword: hasPassword,
      // DÜZELTME BURADA: null yerine undefined kullanıldı
      createdAt: compData.createdAt
        ? compData.createdAt.toISOString()
        : undefined,
      slots: compData.slots.map((s: any) => ({
        ...s,
        _id: s._id ? s._id.toString() : undefined,
      })),
    };

    return { comp: compClean, items: itemsFormatted };
  } catch (error) {
    return null;
  }
}

export default async function SharedCompPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const data = await getData(resolvedParams.id);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Comp Not Found
      </div>
    );
  }

  return <HomeClient items={data.items} initialData={data.comp} />;
}
