import Link from "next/link";
import { requireMaster } from "@/lib/dal";
import { getAllUsersForSettings } from "@/lib/queries";
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
  Button,
} from "@/components/ui";
import { CreateUserForm } from "./create-user-form";
import { approvePendingUser } from "./actions";
import { daysNum } from "@/lib/format";
import { cn } from "@/lib/cn";

const STATUS_LABEL = {
  PENDING: "승인대기",
  ACTIVE: "활성",
  DISABLED: "비활성",
} as const;

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
                  <TR key={u.id} className={cn(u.status === "PENDING" && "bg-amber-50")}>
                    <TD className="font-medium text-slate-800">{u.name}</TD>
                    <TD className="text-slate-500">{u.loginId}</TD>
                    <TD>
                      <RoleBadge role={u.role} />
                    </TD>
                    <TD>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          u.status === "ACTIVE" && "text-emerald-600",
                          u.status === "PENDING" && "text-amber-600",
                          u.status === "DISABLED" && "text-slate-400",
                        )}
                      >
                        {STATUS_LABEL[u.status]}
                      </span>
                    </TD>
                    <TD className="tabular text-right">{daysNum(u.summary.granted)}</TD>
                    <TD className="tabular text-right">{daysNum(u.summary.used)}</TD>
                    <TD
                      className={cn(
                        "tabular text-right font-semibold",
                        u.summary.remaining < 0 ? "text-rose-600" : "text-slate-800",
                      )}
                    >
                      {daysNum(u.summary.remaining)}
                    </TD>
                    <TD className="text-right">
                      <div className="flex justify-end gap-1">
                        {u.status === "PENDING" ? (
                          <form action={approvePendingUser}>
                            <input type="hidden" name="userId" value={u.id} />
                            <Button type="submit" size="sm" variant="success">
                              승인
                            </Button>
                          </form>
                        ) : null}
                        <Link href={`/settings/${u.id}`}>
                          <Button size="sm" variant="outline">
                            상세
                          </Button>
                        </Link>
                      </div>
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
