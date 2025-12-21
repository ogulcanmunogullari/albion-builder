import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Comp from "@/models/Comp";

// Veritabanı bağlantısı
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI tanımlı değil!");
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function DELETE(request: Request) {
  try {
    await connectDB();

    // 1. URL'den ID'yi çekmeyi dene (Query Param)
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    // 2. Eğer URL'de yoksa Body'den okumayı dene
    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // Body boşsa hata verme, devam et
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Can't Find ID" },
        { status: 400 }
      );
    }

    // Veritabanından sil
    const deletedComp = await Comp.findByIdAndDelete(id);

    if (!deletedComp) {
      return NextResponse.json(
        { success: false, error: "No Build Found or Already Deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Build Deleted Successfully",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Server Error";
    console.error("Delete API Error:", error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
