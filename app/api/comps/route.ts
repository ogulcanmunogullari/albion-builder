import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Comp from "@/app/models/Comp";

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
  } catch (error: any) {
    console.error("Save Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
