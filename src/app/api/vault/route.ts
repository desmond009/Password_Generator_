import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import VaultItem from "@/models/VaultItem";
import { vaultItemSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag");
  const filter: Record<string, unknown> = { userId: session.userId };
  if (tag) filter.tags = tag;
  const items = await VaultItem.find(filter).sort({ updatedAt: -1 }).lean();
  // searching is client-side (decrypt), but allow basic plaintext tag filter here
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const body = await req.json().catch(() => null);
  const parsed = vaultItemSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const doc = await VaultItem.create({ ...parsed.data, userId: session.userId });
  return NextResponse.json({ id: doc._id.toString() });
}

export async function PUT(req: NextRequest) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const body = await req.json().catch(() => null);
  const parsed = vaultItemSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const res = await VaultItem.findOneAndUpdate({ _id: id, userId: session.userId }, parsed.data, { new: true });
  if (!res) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const res = await VaultItem.findOneAndDelete({ _id: id, userId: session.userId });
  if (!res) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}


