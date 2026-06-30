import { NextResponse } from "next/server";
import { releaseActiveLogin } from "@/lib/activeLogin";
import { parseSessionIdentity } from "@/lib/session";

export async function POST(request: Request) {
  const identity = parseSessionIdentity(await request.json().catch(() => null));

  if (!identity) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await releaseActiveLogin(identity);

  return NextResponse.json({ ok: true });
}
