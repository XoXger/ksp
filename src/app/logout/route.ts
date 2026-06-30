import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clearActiveLogin } from "@/lib/activeLogin";
import { getSessionIdentity, parseSessionIdentity } from "@/lib/session";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const memberId = requestUrl.searchParams.get("anggotaId");
  const adminId = requestUrl.searchParams.get("adminId");
  const superAdminId = requestUrl.searchParams.get("superAdminId");
  const memberSessionId = requestUrl.searchParams.get("sessionId");
  const identity =
    memberId && memberSessionId
      ? parseSessionIdentity({
          id: memberSessionId,
          userId: memberId,
          role: "ANGGOTA",
        })
      : superAdminId && memberSessionId
        ? parseSessionIdentity({
            id: memberSessionId,
            userId: superAdminId,
            role: "SUPER_ADMIN",
          })
        : adminId && memberSessionId
          ? parseSessionIdentity({
              id: memberSessionId,
              userId: adminId,
              role: "ADMIN",
            })
      : await getSessionIdentity();

  if (identity) {
    await clearActiveLogin(identity);
  }

  const cookieStore = await cookies();
  const currentRole = cookieStore.get("accountRole")?.value;
  const currentMemberId = cookieStore.get("anggotaId")?.value;
  const currentMemberSessionId = cookieStore.get("memberSessionId")?.value;
  const currentAdminId = cookieStore.get("adminId")?.value;
  const currentAdminSessionId = cookieStore.get("adminSessionId")?.value;
  const currentSuperAdminId = cookieStore.get("superAdminId")?.value;
  const currentSuperAdminSessionId =
    cookieStore.get("superAdminSessionId")?.value;
  const isCurrentCookieSession =
    (identity?.role === "ANGGOTA" &&
      currentMemberId === identity.userId &&
      currentMemberSessionId === identity.id) ||
    (identity?.role === "ADMIN" &&
      currentAdminId === identity.userId &&
      currentAdminSessionId === identity.id) ||
    (identity?.role === "SUPER_ADMIN" &&
      currentSuperAdminId === identity.userId &&
      currentSuperAdminSessionId === identity.id);

  if (identity?.role === "ANGGOTA" && isCurrentCookieSession) {
    cookieStore.delete("anggotaId");
    cookieStore.delete("memberSessionId");
  }

  if (identity?.role === "ADMIN" && isCurrentCookieSession) {
    cookieStore.delete("adminId");
    cookieStore.delete("adminSessionId");
  }

  if (identity?.role === "SUPER_ADMIN" && isCurrentCookieSession) {
    cookieStore.delete("superAdminId");
    cookieStore.delete("superAdminSessionId");
  }

  if (!identity || (identity.role === currentRole && isCurrentCookieSession)) {
    cookieStore.delete("sessionId");
    cookieStore.delete("accountRole");
  }

  redirect("/login");
}
