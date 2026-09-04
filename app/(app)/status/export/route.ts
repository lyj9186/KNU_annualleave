import { canApprove, getCurrentUser } from "@/lib/auth/dal";
import { LEAVE_TYPES, type LeaveType } from "@/lib/leave/types";
import { toLeaveUsageCsv } from "@/lib/status/csv";
import { getLeaveUsage } from "@/lib/status/queries";

function month(raw: string | null, fallback: number): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 12 ? n : fallback;
}

/** 연차현황 CSV(엑셀) 다운로드. `/status` 와 같은 조회 조건(y·from·to·user·type). */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !canApprove(user.role)) {
    return new Response("권한이 없습니다.", { status: 403 });
  }

  const sp = new URL(req.url).searchParams;
  const now = new Date();

  const yRaw = Number(sp.get("y"));
  const year =
    Number.isInteger(yRaw) && yRaw >= 2000 && yRaw <= 2100
      ? yRaw
      : now.getUTCFullYear();
  const fromMonth = month(sp.get("from"), now.getUTCMonth() + 1);
  const toMonth = Math.max(fromMonth, month(sp.get("to"), fromMonth));

  const userIdRaw = sp.get("user") ?? "";
  const typeRaw = sp.get("type") ?? "";
  const type: LeaveType | undefined = (LEAVE_TYPES as string[]).includes(typeRaw)
    ? (typeRaw as LeaveType)
    : undefined;

  const rows = await getLeaveUsage({
    year,
    fromMonth,
    toMonth,
    userId: userIdRaw || undefined,
    type,
  });
  const csv = toLeaveUsageCsv(rows);

  const mm = (m: number) => String(m).padStart(2, "0");
  const range =
    fromMonth === toMonth
      ? `${year}-${mm(fromMonth)}`
      : `${year}-${mm(fromMonth)}~${mm(toMonth)}`;
  const koName = encodeURIComponent(`연차현황_${range}.csv`);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leave-status-${range}.csv"; filename*=UTF-8''${koName}`,
      "Cache-Control": "no-store",
    },
  });
}
