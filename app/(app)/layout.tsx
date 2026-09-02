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
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2.5">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-800">연차 관리</span>
            <Nav items={items} />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <RoleBadge role={user.role} />
            <span className="font-medium text-slate-800">{user.name}</span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800"
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
