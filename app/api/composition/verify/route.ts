import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Comp from "@/models/Comp";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { id, password } = await request.json();

    if (!id || password === undefined) {
      return NextResponse.json(
        { success: false, message: "Eksik bilgi" },
        { status: 400 }
      );
    }

    // KRİTİK NOKTA: Modelde password gizli olduğu için (select: false),
    // burada +password diyerek onu özel olarak istiyoruz.
    const comp = await Comp.findById(id).select("+password");

    if (!comp) {
      return NextResponse.json(
        { success: false, message: "Kayıt bulunamadı" },
        { status: 404 }
      );
    }
    const dbPassword = comp.password || "";

    // Şifre kontrolü
    // Not: Gerçek projelerde bcrypt ile hashlenmiş şifre kontrol edilmelidir.
    // Şimdilik düz metin (plaintext) karşılaştırması yapıyoruz.
    if (dbPassword === password) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, message: "Hatalı şifre" },
        { status: 401 }
      );
    }
  } catch (error: unknown) {
    console.error("Verify Error:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
