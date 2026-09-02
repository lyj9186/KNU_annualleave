import { canApprove, requireUser } from "@/lib/auth/dal";
import { Nav, type NavItem } from "@/components/nav";
import { RoleBadge } from "@/components/ui";
import { logout } from "@/lib/auth/actions";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();

  const items: NavItem[] = [
    { href: "/main", label: "메인" },
    { href: "/leave", label: "연차 등록" },
  ];
  if (canApprove(user.role)) {
    items.push({ href: "/approvals", label: "승인/반려/취소" });
  }
  if (user.role === "MASTER") {
    items.push({ href: "/settings", label: "연차설정" });
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2.5">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-title">연차 관리</span>
            <Nav items={items} />
          </div>
          <div className="flex items-center gap-2 text-sm text-subtle">
            <RoleBadge role={user.role} />
            <span className="font-medium text-title">{user.name}</span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md px-2 py-1 text-xs text-muted hover:bg-slate-100 hover:text-title"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
