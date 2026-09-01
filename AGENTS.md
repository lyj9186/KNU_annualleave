<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 연차 관리 시스템 — 프로젝트 노트

- **Prisma 7**: 드라이버 어댑터 필수. 클라이언트는 `lib/generated/prisma/` 에 TS로 생성됨(gitignore). 설정 파일은 `prisma7.config.ts`. 스키마 변경 후 `npm run db:migrate`.
- **인증**: 자체 구현. `proxy.ts`(Next 16 미들웨어, Node 런타임) = 낙관적 리다이렉트만. 실제 권한 검증은 각 page/action 에서 `lib/dal.ts` 의 `requireUser` / `requireApprover` / `requireMaster` 로.
- **서버 액션**: 모든 mutation 은 `use server` 액션. 반드시 액션 내부에서 권한 재확인. `useActionState` + `FormState`(lib/validation.ts) 패턴.
- **연차 계산**: `lib/leave.ts` 순수 함수. 수정 시 `lib/leave.test.ts` 갱신하고 `npm test`.
- **날짜**: DB 는 `@db.Date`, 코드에서는 항상 UTC 자정(`Date.UTC`) 기준으로 다룸.
- 변경 후 검증: `npx tsc --noEmit` → `npm test` → `npm run build`.
