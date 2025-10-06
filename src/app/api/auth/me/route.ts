import { NextResponse } from "next/server";
import { readSession } from "@/src/lib/auth";
import { connectToDatabase } from "@/src/lib/db";
import User from "@/src/models/User";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ user: null });
  await connectToDatabase();
  const user = await User.findById(session.userId).lean();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { id: user._id.toString(), email: user.email, kdfSaltB64: user.kdfSaltB64 } });
}


