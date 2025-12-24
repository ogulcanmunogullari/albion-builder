import { NextResponse } from "next/server";
import Comp from "models/Comp";
import { connectDB } from "@/lib/db";

// Veritabanı bağlantısı

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
