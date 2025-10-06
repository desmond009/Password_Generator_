import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { connectToDatabase } from "@/src/lib/db";
import User from "@/src/models/User";
import { registerSchema } from "@/src/lib/validators";
import { createSessionJwt, setSessionCookie } from "@/src/lib/auth";

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const json = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const kdfSaltB64 = randomBytes(16).toString("base64");

  const user = await User.create({ email, passwordHash, kdfSaltB64 });

  const token = await createSessionJwt({ userId: user._id.toString() }, 60 * 60 * 24 * 7);
  await setSessionCookie(token, 60 * 60 * 24 * 7);

  return NextResponse.json({ ok: true });
}


