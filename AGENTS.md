<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 연차 관리 시스템 — 프로젝트 노트

## 구조 (기능별 모듈)

```
lib/
  db.ts · cn.ts · form.ts · schema.ts · datetime.ts · balance.ts · revalidate.ts   (공유)
  auth/      jwt · session · password · dal · schema · actions
  leave/     types · calc(+test) · schema(+test) · request(DTO) · queries · actions
  approvals/ schema · queries(+ getPendingApprovalCount) · actions
  users/     schema · queries · actions
  dashboard/ queries        (메인 캘린더 · 잔여표)
  calendar/  grid(+test)
  status/    types · expand(+test) · csv(+test) · queries   (월별 연차현황 + CSV)
components/
  ui/        디자인 시스템 (배럴 index.ts). 시맨틱 토큰은 globals.css @theme.
             pages/forms 는 raw slate/blue 대신 토큰(text-title/muted, border-line …) 사용.
  month-picker  연/월 드롭다운 (메인 달력 · 연차현황 공유, ?y=&m= 이동)
```

- **`@/lib/leave`** = 클라이언트 공용 표면(types+calc)만 re-export. queries/actions/request 는 서버 전용 → 직접 import.

## 규칙

- **Prisma 7**: 드라이버 어댑터 필수. 클라이언트는 `lib/generated/prisma/` 에 TS로 생성됨(gitignore). 설정 파일은 `prisma7.config.ts`. 스키마 변경 후 `npm run db:migrate`.
- **인증**: 자체 구현. `proxy.ts`(Next 16 미들웨어, Node 런타임) = 낙관적 리다이렉트만. 실제 권한 검증은 각 page/action 에서 `lib/auth/dal.ts` 의 `requireUser` / `requireApprover` / `requireMaster` 로.
- **서버 액션**: 모든 mutation 은 `lib/<feature>/actions.ts` 의 `use server` 함수. 액션 내부에서 권한 재확인. `useActionState` + `FormState`(`lib/form.ts`). FormData 는 `readForm()`, Zod 에러는 `fieldErrors()`. 재검증은 `revalidateLeaveViews()` / `revalidateUserViews()`.
- **연차 계산**: `lib/leave/calc.ts` 순수 함수. 수정 시 `lib/leave/calc.test.ts` 갱신.
- **날짜**: DB 는 `@db.Date`, 코드에서는 항상 UTC 자정 기준(`lib/datetime.ts`). 사용자의 "오늘"만 로컬(`todayIso`). 표시 형식은 `YYYY-MM-DD (요일)` (`ymdKo`).
- **역할**:
  - 마스터 = 결재·계정관리 전용. 연차를 신청하지 않으므로 캘린더·현황표·연차현황·"연차 등록"(메뉴/`/leave`/`createLeaveRequest`)에서 제외.
  - 팀장·마스터는 본인 신청도 직접 승인/반려/취소 가능 (`lib/approvals/actions.ts` 에 자가 승인 제한 없음).
  - 연차현황(`/status`)·승인(`/approvals`) = 승인자(팀장·마스터) 전용. 메인 하단 현황표는 일반 사용자에게 본인 행만 (`getYearOverview(year, onlyUserId)`), 달력은 전원 공개.
- **비밀번호**: 최소 4자 (`passwordField`, `lib/schema.ts`).
- 변경 후 검증: `npm run lint` → `npm run typecheck` → `npm test` → `npm run build`.
