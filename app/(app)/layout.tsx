import { canApprove, requireUser } from "@/lib/auth/dal";
import { getPendingApprovalCount } from "@/lib/approvals/queries";
import { Nav, type NavItem } from "@/components/nav";
import { RoleBadge } from "@/components/ui";
import { logout } from "@/lib/auth/actions";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();

  const items: NavItem[] = [
    { href: "/main", label: "메인" },
    // 사용자·팀장은 본인 신청, 마스터는 대리 등록.
    { href: "/leave", label: "연차 등록" },
  ];
  if (canApprove(user.role)) {
    const pending = await getPendingApprovalCount();
    items.push({ href: "/approvals", label: "승인", badge: pending || undefined });
    items.push({ href: "/status", label: "연차현황" });
  }
  if (user.role === "MASTER") {
    items.push({ href: "/settings", label: "연차설정" });
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-1.5 px-4 py-2 sm:py-2.5">
          <span className="shrink-0 text-sm font-bold text-title">연차 관리</span>
          <div className="order-last w-full sm:order-none sm:w-auto">
            <Nav items={items} />
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm text-subtle">
            <RoleBadge role={user.role} />
            <span className="max-w-[7rem] truncate font-medium text-title">
              {user.name}
            </span>
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
