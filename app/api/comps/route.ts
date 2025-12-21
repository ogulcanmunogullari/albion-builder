// app/api/comps/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Comp from "@/models/Comp"; // Import yolu güncellendi

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  if (!process.env.MONGODB_URI)
    throw new Error("MONGODB_URI environment variable is not defined");
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.title || !body.slots) {
      return NextResponse.json(
        { error: "Title and slots are required." },
        { status: 400 }
      );
    }

    const newComp = await Comp.create({
      title: body.title,
      description: body.description || "",
      rallyPoint: body.rallyPoint || "",
      swap: body.swap || "",
      password: body.password || "",
      slots: body.slots,
    });

    return NextResponse.json(
      { success: true, id: newComp._id },
      { status: 201 }
    );
  } catch (error: unknown) {
    // any yerine unknown kullanıldı
    console.error("Save Error:", error);
    // Hata mesajını güvenli bir şekilde alıyoruz
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.id)
      return NextResponse.json({ error: "ID required" }, { status: 400 });

    const comp = await Comp.findById(body.id);
    if (!comp)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // 1. KİMLİK DOĞRULAMA
    if (comp.password && comp.password !== body.password) {
      return NextResponse.json(
        { error: "Incorrect Password!" },
        { status: 403 }
      );
    }

    // 2. GÜNCELLEME
    comp.title = body.title;
    comp.description = body.description || "";
    comp.rallyPoint = body.rallyPoint || "";
    comp.swap = body.swap || "";
    comp.slots = body.slots;

    // 3. ŞİFRE GÜNCELLEME
    if (body.nextPassword !== undefined) {
      comp.password = body.nextPassword;
    }

    await comp.save();

    return NextResponse.json({ success: true, id: comp._id });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
