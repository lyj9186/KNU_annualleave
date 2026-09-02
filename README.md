# 연차 관리 시스템

사내 연차 신청 · 승인 · 관리 웹 애플리케이션 (사용자 20명 내외 규모).

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| 프레임워크 | Next.js 16 (App Router) · React 19 · TypeScript |
| 스타일 | Tailwind CSS v4 |
| DB | PostgreSQL ([Neon](https://neon.tech) 권장) |
| ORM | Prisma 7 (`@prisma/adapter-pg` 드라이버 어댑터) |
| 인증 | 자체 구현 — `jose` (JWT 세션 쿠키) + `bcryptjs` |
| 검증 | Zod |
| 배포 | Vercel + GitHub |
| 테스트 | Vitest |

## 역할과 권한

| 기능 | 사용자 | 팀장 | 마스터 |
| --- | :---: | :---: | :---: |
| 메인 캘린더 (연/월 드롭다운) | 전체 | 전체 | 전체 |
| 메인 하단 현황표 | 본인만 | 전체 | 전체 |
| 연차 등록 / 본인 신청 철회 | O | O | - |
| 승인 / 반려 / 취소 (본인 신청 포함) | - | O | O |
| 연차현황 (월별 조회 · CSV 다운로드) | - | O | O |
| 연차설정 (계정 · 비밀번호 · 잔여) | - | - | O |

- **마스터**는 연차를 사용하지 않는 결재·계정관리 전용 계정입니다 — 캘린더·현황표·연차현황·연차 등록에서 제외됩니다.
- **회원가입**은 `승인대기(PENDING)` 상태로 생성되며, 마스터가 활성화해야 로그인할 수 있습니다.
- **연차 종류**: 연차(−1일) · 오전 반차(−0.5일) · 오후 반차(−0.5일) · 병가(연차 미차감, 사용일수만 기록).
- 잔여연차 = 가용연차 − (승인된 연차·반차 합계 + 마스터 수동 조정).
- 영업일(월~금)만 계산하며 공휴일은 자동 제외하지 않습니다.
- **승인**: 연차 반영 / **반려**·**취소**: 반영 안 됨.

---

## 1. 로컬 개발 환경 설정

### 1-1. 의존성 설치

```bash
npm install
```

### 1-2. 데이터베이스 준비 (Neon)

DB는 Neon **브랜치**로 운영/개발을 분리합니다.

| 환경 | Neon 브랜치 | 연결 위치 |
| --- | --- | --- |
| 운영 (Vercel) | `main` (기본) | Vercel 환경변수 |
| 로컬 개발 | `dev` | 로컬 `.env` |

1. <https://neon.tech> 가입 후 프로젝트 생성 — Region은 `AWS ap-southeast-1 (Singapore)` (한국에서 가장 가까움, 왕복 약 70~90ms).
2. **Branches** → **New Branch** 로 `dev` 브랜치 생성 (Parent: `main`, Include data: Head).
3. `dev` 브랜치의 **Connection Details** 에서 연결 문자열을 복사합니다. (상단 브랜치 선택이 `dev` 인지 확인)
   - **Pooled connection** → `DATABASE_URL`
   - **Direct connection** → `DIRECT_URL` (없으면 Pooled 에서 `-pooler` 만 제거)

### 1-3. 환경변수

`.env` 파일을 열어 값을 채웁니다 (`.env` 는 git에 커밋되지 않습니다).

```bash
DATABASE_URL="postgresql://...-pooler...neon.tech/neondb?sslmode=require&channel_binding=require"   # dev 브랜치 Pooled
DIRECT_URL="postgresql://...neon.tech/neondb?sslmode=require&channel_binding=require"                # dev 브랜치 Direct
SESSION_SECRET="<openssl rand -base64 32 결과>"
```

`SESSION_SECRET` 생성:

```bash
openssl rand -base64 32
```

### 1-4. 스키마 반영 & 마스터 계정 생성

```bash
npm run db:migrate      # 최초 실행 시 마이그레이션 생성 + 적용 (이름: init 등)
npm run db:seed         # 마스터 계정 생성 (기본: master / master1234)
```

> 마스터 계정 값을 바꾸려면: `SEED_MASTER_ID=admin SEED_MASTER_PW=... SEED_MASTER_NAME=관리자 npm run db:seed`

### 1-5. 개발 서버

```bash
npm run dev
```

<http://localhost:3000> → 로그인 (`master` / `master1234`) → 로그인 후 **연차설정 > 상세**에서 비밀번호를 변경하세요.

### 그 외 명령

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # 단위 테스트 (Vitest — 순수 로직)
npm run db:studio   # Prisma Studio (DB GUI)
npm run db:reset    # dev 브랜치 초기화 (전체 삭제 → 마이그레이션 재적용 → 마스터 시드)
npm run build       # 프로덕션 빌드 검증
```

> `db:reset` 은 `.env` 가 가리키는 DB(=dev 브랜치)만 건드립니다. 운영에는 절대 영향 없음.

---

## 2. GitHub + Vercel 배포

### 2-1. GitHub 저장소

```bash
git init
git add -A
git commit -m "init: 연차 관리 시스템"
git branch -M main
git remote add origin https://github.com/<계정>/<저장소>.git
git push -u origin main
```

> `gh` CLI가 없으면 github.com 에서 빈 저장소를 먼저 만든 뒤 remote를 추가하세요.

### 2-2. Vercel 프로젝트

1. <https://vercel.com/new> → GitHub 저장소 **Import**.
2. Framework Preset은 자동으로 **Next.js**. Build/Output 설정은 기본값 그대로.
   - Function Region은 `vercel.json` 에서 `sin1` (Singapore) 로 고정해 두었습니다 — DB와 같은 리전이라야 요청당 왕복이 짧습니다.
3. **Environment Variables** 에 아래 3개를 등록 (Production + Preview) — 여기에는 **`main` 브랜치** 연결 문자열을 넣습니다:

   | Key | Value |
   | --- | --- |
   | `DATABASE_URL` | Neon `main` 브랜치 Pooled connection |
   | `DIRECT_URL` | Neon `main` 브랜치 Direct connection |
   | `SESSION_SECRET` | 로컬과 **다른** 새 랜덤 값 (`openssl rand -base64 32`) |

4. **Deploy**.

### 2-3. 스키마 & 마스터 계정 (최초 1회)

운영(`main`) 브랜치 연결 문자열을 임시로 환경변수에 넣고 실행:

```bash
DATABASE_URL="<main Pooled>" DIRECT_URL="<main Direct>" npm run db:deploy   # 운영에 마이그레이션 적용
DATABASE_URL="<main Pooled>" DIRECT_URL="<main Direct>" npm run db:seed     # 운영에 마스터 계정 생성
```

### 2-4. 이후 스키마 변경 워크플로우

1. `prisma/schema.prisma` 수정 → `npm run db:migrate` (로컬 `dev` 브랜치에 적용 + 마이그레이션 파일 생성)
2. `lib/leave/calc.test.ts` 등 갱신 → `npm run lint && npm run typecheck && npm test`
3. 커밋 & push → Vercel 자동 배포
4. 운영(`main`) 브랜치에 마이그레이션 적용:
   `DATABASE_URL="<main>" DIRECT_URL="<main>" npm run db:deploy`

---

## 프로젝트 구조

라우트는 얇게 유지하고, 도메인 로직은 `lib/<기능>/` 모듈에 모읍니다.

```
app/
  (auth)/            로그인 · 회원가입 (페이지 + 클라이언트 폼)
  (app)/             인증 필요 영역 (공통 레이아웃 = 상단 네비)
    main/            메인 — 월별 캘린더(연/월 드롭다운) + 연차 현황표
    leave/           연차 등록 + 내 신청 내역 (마스터 제외)
    approvals/       승인/반려/취소 (상태·종류 필터)
    status/          연차현황 — 월별 조회 + CSV 다운로드(export/route.ts). 팀장·마스터 전용
    settings/[userId]/  연차설정 — 계정 목록 · 생성 · 상세
lib/
  db · cn · form · schema · datetime · balance · revalidate   (공유)
  auth/       jwt · session · password · dal · schema · actions
  leave/      types · calc · schema · request(DTO) · queries · actions
  approvals/  schema · queries · actions
  users/      schema · queries · actions
  dashboard/  queries      (메인 캘린더 · 잔여표)
  calendar/   grid          (달력 그리드 계산)
  status/     types · expand · csv · queries   (월별 연차현황 + CSV)
components/
  ui/         디자인 시스템 (index.ts 배럴) — Button/Field/Card/Table/Badge/Stat/ChipLink …
  calendar-month · month-picker · request-table · balance-cells · nav
proxy.ts             낙관적 인증 리다이렉트 (Next 16 미들웨어)
prisma/
  schema.prisma      데이터 모델
  seed.ts            마스터 계정 시드
```

- **디자인 토큰**: `app/globals.css` 의 `@theme` (surface/line/text 스케일/brand). 컴포넌트·페이지는 이 토큰만 사용.
- **`@/lib/leave`** 는 클라이언트 공용 표면(타입·계산)만 노출. 서버 전용 쿼리/액션은 `@/lib/leave/queries` 처럼 직접 import.

## 알려진 사항

- `npm audit` 에서 `deepmerge-ts` 관련 high 경고가 나옵니다 — Prisma CLI(개발 의존성)의 전이 의존성이며 런타임에 포함되지 않습니다. Prisma 업스트림 패치 대기 중.
