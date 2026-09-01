import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const nextParam = typeof sp.next === "string" ? sp.next : undefined;
  return <LoginForm next={nextParam} />;
}
