import { cookies } from "next/headers";

export async function getMemberIdFromSessionParam(
  _sessionId?: string,
  anggotaIdParam?: string,
) {
  if (anggotaIdParam) {
    return anggotaIdParam;
  }

  return (await cookies()).get("anggotaId")?.value ?? null;
}
