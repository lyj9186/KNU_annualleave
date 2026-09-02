import { canApprove, getCurrentUser } from "@/lib/auth/dal";
import { clampMonth } from "@/lib/calendar/grid";
import { toLeaveUsageCsv } from "@/lib/status/csv";
import { getMonthlyLeaveUsage } from "@/lib/status/queries";

/** 월별 연차현황 CSV(엑셀) 다운로드. `/status` 와 같은 승인자 전용. */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !canApprove(user.role)) {
    return new Response("권한이 없습니다.", { status: 403 });
  }

  const url = new URL(req.url);
  const now = new Date();
  const yParam = Number(url.searchParams.get("y"));
  const mParam = Number(url.searchParams.get("m"));
  const { y, m0 } = clampMonth(
    Number.isFinite(yParam) && yParam > 0 ? yParam : now.getUTCFullYear(),
    Number.isFinite(mParam) && mParam > 0 ? mParam : now.getUTCMonth() + 1,
  );

  const rows = await getMonthlyLeaveUsage(y, m0);
  const csv = toLeaveUsageCsv(rows);

  const mm = String(m0 + 1).padStart(2, "0");
  const asciiName = `leave-status-${y}-${mm}.csv`;
  const koName = encodeURIComponent(`연차현황_${y}-${mm}.csv`);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${koName}`,
      "Cache-Control": "no-store",
    },
  });
}
