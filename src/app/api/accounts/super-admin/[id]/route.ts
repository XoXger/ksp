import { updateAdminAccountProfile } from "@/lib/adminAccountProfileUpdate";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return updateAdminAccountProfile(request, "SUPER_ADMIN", id);
}
