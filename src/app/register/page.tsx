import { RegisterView } from "@/components/ui/RegisterView";
import { registerAnggota } from "./actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return <RegisterView formAction={registerAnggota} status={status} />;
}
