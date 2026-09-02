import Link from "next/link";
import { requireMaster } from "@/lib/auth/dal";
import { getAllUsersForSettings } from "@/lib/users/queries";
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  EmptyRow,
  RoleBadge,
  UserStatusText,
  Button,
  RecordList,
  RecordEmpty,
  RecordCard,
  RecordRow,
} from "@/components/ui";
import { BalanceCells } from "@/components/balance-cells";
import { CreateUserForm } from "./create-user-form";
import { approvePendingUser } from "@/lib/users/actions";
import { daysNum } from "@/lib/datetime";
import { cn } from "@/lib/cn";

function RowActions({ id, pending }: { id: string; pending: boolean }) {
  return (
    <div className="flex justify-end gap-1">
      {pending ? (
        <form action={approvePendingUser}>
          <input type="hidden" name="userId" value={id} />
          <Button type="submit" size="sm" variant="success">
            승인
          </Button>
        </form>
      ) : null}
      <Link href={`/settings/${id}`}>
        <Button size="sm" variant="outline">
          상세
        </Button>
      </Link>
    </div>
  );
}

export default async function SettingsPage() {
  await requireMaster();
  const year = new Date().getUTCFullYear();
  const users = await getAllUsersForSettings(year);
  const pendingCount = users.filter((u) => u.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="계정 목록"
          description={
            pendingCount > 0
              ? `승인 대기 ${pendingCount}명`
              : `전체 ${users.length}명 · ${year}년 기준`
          }
        />
        <CardBody className="p-0">
          {users.length === 0 ? (
            <RecordEmpty />
          ) : (
            <RecordList>
              {users.map((u) => (
                <RecordCard
                  key={u.id}
                  className={cn(u.status === "PENDING" && "bg-amber-50")}
                  title={u.name}
                  aside={<RoleBadge role={u.role} />}
                  footer={<RowActions id={u.id} pending={u.status === "PENDING"} />}
                >
                  <RecordRow label="아이디">{u.loginId}</RecordRow>
                  <RecordRow label="상태">
                    <UserStatusText status={u.status} />
                  </RecordRow>
                  <RecordRow label="가용 · 사용 · 잔여">
                    <span className="tabular">
                      {daysNum(u.summary.granted)} · {daysNum(u.summary.used)} ·{" "}
                      <span
                        className={cn(
                          "font-semibold",
                          u.summary.remaining < 0
                            ? "text-danger"
                            : "text-title",
                        )}
                      >
                        {daysNum(u.summary.remaining)}
                      </span>
                    </span>
                  </RecordRow>
                </RecordCard>
              ))}
            </RecordList>
          )}
          <Table>
            <THead>
              <TR>
                <TH>이름</TH>
                <TH>아이디</TH>
                <TH>역할</TH>
                <TH>상태</TH>
                <TH className="text-right">가용</TH>
                <TH className="text-right">사용</TH>
                <TH className="text-right">잔여</TH>
                <TH className="text-right">관리</TH>
              </TR>
            </THead>
            <TBody>
              {users.length === 0 ? (
                <EmptyRow colSpan={8} />
              ) : (
                users.map((u) => (
                  <TR
                    key={u.id}
                    className={cn(u.status === "PENDING" && "bg-amber-50")}
                  >
                    <TD className="font-medium text-title">{u.name}</TD>
                    <TD className="text-muted">{u.loginId}</TD>
                    <TD>
                      <RoleBadge role={u.role} />
                    </TD>
                    <TD>
                      <UserStatusText status={u.status} />
                    </TD>
                    <BalanceCells summary={u.summary} />
                    <TD className="text-right">
                      <RowActions id={u.id} pending={u.status === "PENDING"} />
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="계정 생성" description="생성 즉시 활성 상태가 됩니다." />
        <CardBody>
          <CreateUserForm />
        </CardBody>
      </Card>
    </div>
  );
}
