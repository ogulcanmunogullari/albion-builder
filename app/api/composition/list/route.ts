import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Comp from "@/models/Comp";

export async function GET() {
  try {
    await connectDB();

    // Sadece istediğin alanları ÇEKERKEN (Fetch aşamasında) filtreliyoruz
    const optimizedComps = await Comp.aggregate([
      {
        $project: {
          _id: 1,
          title: 1,
          createdAt: 1,
          isPublic: 1,
          viewerPassword: 1,
          // DB SEVİYESİNDE HESAPLAMA: slots dizisinin uzunluğunu burada alıyoruz
          // Böylece slots içindeki devasa item dataları ağ üzerinden TAŞINMIYOR.
          slots: { $size: { $ifNull: ["$slots", []] } },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return NextResponse.json(optimizedComps);
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
