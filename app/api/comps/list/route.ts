import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Comp from "@/models/Comp"; // Model adınız Comp ise

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

export async function GET() {
  try {
    await connectDB();
    // Filtreyi kaldırdık, her şeyi getiriyoruz
    const comps = await Comp.find({})
      .select("title slots createdAt isPublic viewerPassword") // viewerPassword BURADA OLMALI
      .sort({ createdAt: -1 });
    return NextResponse.json(comps);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
