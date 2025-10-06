import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/src/lib/db";
import User from "@/src/models/User";
import { loginSchema } from "@/src/lib/validators";
import { createSessionJwt, setSessionCookie } from "@/src/lib/auth";

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const json = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  if (!user) {
    // do not reveal if user exists
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSessionJwt({ userId: user._id.toString() }, 60 * 60 * 24 * 7);
  await setSessionCookie(token, 60 * 60 * 24 * 7);
  return NextResponse.json({ ok: true, kdfSaltB64: user.kdfSaltB64 });
}


