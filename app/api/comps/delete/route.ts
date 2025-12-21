// app/api/comps/delete/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Comp from "@/models/Comp";

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI missing");
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function POST(request: Request) {
  try {
    await connectDB();
    const { id, password } = await request.json();

    if (!id)
      return NextResponse.json({ error: "ID required" }, { status: 400 });

    const comp = await Comp.findById(id);
    if (!comp)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (comp.password && comp.password !== password) {
      return NextResponse.json({ error: "Wrong password" }, { status: 403 });
    }

    await Comp.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
