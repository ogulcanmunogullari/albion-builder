import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Comp from "@/models/Comp";

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  if (!process.env.MONGODB_URI)
    throw new Error("MONGODB_URI environment variable is not defined");
  await mongoose.connect(process.env.MONGODB_URI);
};

// 1. YENİ KAYIT (POST)
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const newComp = await Comp.create({
      title: body.title,
      rallyPoint: body.rallyPoint,
      swap: body.swap,
      isPublic: body.isPublic ?? true,
      viewerPassword: body.viewerPassword || "",
      password: body.nextPassword || "", // Admin şifresi eşlendi
      slots: body.slots,
    });

    return NextResponse.json(
      { success: true, id: newComp._id },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// 2. GÜNCELLEME (PUT)
export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const comp = await Comp.findById(body.id);
    if (!comp)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Admin Şifre Kontrolü
    if (comp.password && comp.password !== body.password) {
      return NextResponse.json(
        { error: "Incorrect Admin Password!" },
        { status: 403 }
      );
    }

    comp.title = body.title;
    comp.rallyPoint = body.rallyPoint || "";
    comp.swap = body.swap || "";
    comp.slots = body.slots;
    comp.isPublic = body.isPublic;
    comp.viewerPassword = body.viewerPassword;

    // Admin şifresini güncelleme
    if (body.nextPassword !== undefined) {
      comp.password = body.nextPassword;
    }

    if (comp.password !== body.password) {
      return NextResponse.json(
        { error: "Unauthorized: Incorrect Admin Password!" },
        { status: 403 }
      );
    }

    await comp.save();
    return NextResponse.json({ success: true, id: comp._id });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
