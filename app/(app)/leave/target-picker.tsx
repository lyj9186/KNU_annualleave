"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui";
import { ROLE_LABELS, type Role } from "@/lib/leave";

/** 마스터 대리 등록 — 대상자 선택 시 `/leave?userId=` 로 이동 */
export function ProxyTargetPicker({
  targets,
  current,
}: {
  targets: { id: string; name: string; role: Role }[];
  current: string | null;
}) {
  const router = useRouter();
  return (
    <Select
      aria-label="대리 등록 대상자"
      value={current ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        router.push(v ? `/leave?userId=${v}` : "/leave");
      }}
    >
      <option value="">대상자 선택…</option>
      {targets.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name} ({ROLE_LABELS[t.role]})
        </option>
      ))}
    </Select>
  );
}
