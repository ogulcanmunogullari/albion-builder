// app/api/comps/verify/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Comp from "@/models/Comp";

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  if (!process.env.MONGODB_URI) throw new Error("Mongo URI yok");
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function POST(request: Request) {
  try {
    await connectDB();
    const { id, password } = await request.json();

    const comp = await Comp.findById(id);
    if (!comp)
      return NextResponse.json({ success: false, message: "Comp not found" });

    if (comp.password === password) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: "Wrong Password" });
    }
  } catch (error: unknown) {
    // Verify işleminde detaylı hata mesajı dönmek yerine genel hata dönmek bazen daha güvenlidir
    console.error("Verify Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
