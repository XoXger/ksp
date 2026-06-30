import { LoginView } from "@/components/ui/LoginView";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return <LoginView error={error} />;
}
