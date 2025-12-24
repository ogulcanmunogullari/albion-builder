import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Comp from "@/models/Comp";
import { IComposition } from "@/types";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const { eventTime, ...otherData } = body;

    // Şifre boş string ise null veya undefined yapalım ki veritabanı temiz kalsın (opsiyonel)
    // Ancak modelde default değer vermediğimiz için string olarak kalması daha iyi.

    const newComp = await Comp.create({
      ...otherData,
      swap: eventTime, // UI 'eventTime' gönderiyor, DB 'swap' sütununa yazıyor
    });

    return NextResponse.json({ success: true, data: newComp, id: newComp._id });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Create Error:", error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // nextPassword: Kullanıcının inputa yazdığı YENİ şifre
    // password: Yetkilendirme için kullanılan ESKİ (unlock) şifre
    const { id, eventTime, password, nextPassword, ...updateData } = body;

    // 1. Yetki Kontrolü
    const existingComp = await Comp.findById(id).select("+password");
    if (!existingComp) {
      return NextResponse.json(
        { success: false, message: "Kayıt bulunamadı" },
        { status: 404 }
      );
    }

    // Eğer build zaten şifreliyse, işlem yapmak için eski şifre doğru mu diye bak
    if (existingComp.password && existingComp.password !== password) {
      return NextResponse.json(
        { success: false, message: "Yanlış admin şifresi" },
        { status: 401 }
      );
    }

    // 2. Güncelleme Verisini Hazırla
    const dataToSave: IComposition = {
      ...updateData,
      swap: eventTime,
    };

    // EĞER kullanıcı yeni bir şifre girdiyse (nextPassword), onu kaydet.
    // nextPassword boş string ise ("") şifreyi kaldırmak istiyor olabilir, buna da izin veriyoruz.
    if (nextPassword !== undefined) {
      dataToSave.password = nextPassword;
    }

    // 3. Veritabanını Güncelle
    const updatedComp = await Comp.findByIdAndUpdate(id, dataToSave, {
      new: true,
    });

    return NextResponse.json({ success: true, data: updatedComp });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Update Error:", error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
