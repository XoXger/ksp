import { NextResponse } from "next/server";
import { touchActiveLogin } from "@/lib/activeLogin";
import { parseSessionIdentity } from "@/lib/session";

export async function POST(request: Request) {
  const identity = parseSessionIdentity(await request.json().catch(() => null));

  if (!identity) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await touchActiveLogin(identity);
  } catch (error) {
    console.warn("Active login heartbeat gagal diperbarui.", error);

    return NextResponse.json({ ok: false }, { status: 200 });
  }

  return NextResponse.json({ ok: true });
}
