import Link from "next/link";
import { notFound } from "next/navigation";
import { requireMaster } from "@/lib/auth/dal";
import { getUserDetail } from "@/lib/users/queries";
import { Card, CardBody, CardHeader, RoleBadge } from "@/components/ui";
import { RequestTable } from "@/components/request-table";
import { DEFAULT_ANNUAL_DAYS } from "@/lib/leave";
import { ymdKo } from "@/lib/datetime";
import {
  BalanceForm,
  ResetPasswordForm,
  UserEditForm,
} from "./settings-forms";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireMaster();
  const { userId } = await params;
  const detail = await getUserDetail(userId);
  if (!detail) notFound();

  const { user, balances, requests } = detail;
  const year = new Date().getUTCFullYear();
  const current = balances.find((b) => b.year === year);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="text-sm text-brand hover:underline">
          ← 목록
        </Link>
        <h1 className="text-lg font-bold text-title">{user.name}</h1>
        <RoleBadge role={user.role} />
        <span className="text-sm text-faint">
          {user.loginId} · 가입 {ymdKo(user.createdAt)}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="계정 정보" />
          <CardBody>
            <UserEditForm
              userId={user.id}
              name={user.name}
              role={user.role}
              status={user.status}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="비밀번호 초기화" />
          <CardBody>
            <ResetPasswordForm userId={user.id} />
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="연차 설정"
            description={`현재 ${year}년: 가용 ${current?.grantedDays ?? DEFAULT_ANNUAL_DAYS}일 / 조정 ${current?.adjustDays ?? 0}일`}
          />
          <CardBody>
            <BalanceForm
              userId={user.id}
              year={year}
              grantedDays={current?.grantedDays ?? DEFAULT_ANNUAL_DAYS}
              adjustDays={current?.adjustDays ?? 0}
            />
            {balances.length > 0 ? (
              <ul className="mt-4 space-y-1 text-xs text-muted">
                {balances.map((b) => (
                  <li key={b.id}>
                    {b.year}년 · 가용 {b.grantedDays}일 · 조정 {b.adjustDays}일
                  </li>
                ))}
              </ul>
            ) : null}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="신청 내역" />
        <CardBody className="p-0">
          <RequestTable rows={requests} emptyText="신청 내역이 없습니다." />
        </CardBody>
      </Card>
    </div>
  );
}
