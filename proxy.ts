import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, decryptSession } from "@/lib/auth/jwt";

const PUBLIC_PATHS = ["/login", "/signup"];

/**
 * 낙관적(optimistic) 인증 체크 — 쿠키만 읽어 리다이렉트.
 * 실제 권한 검증은 각 페이지/서버액션의 DAL(requireUser/requireMaster 등)에서 수행.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await decryptSession(req.cookies.get(COOKIE_NAME)?.value);
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p);

  // 루트 → 로그인 상태에 따라 분기
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(session ? "/main" : "/login", req.nextUrl),
    );
  }

  if (!session && !isPublic) {
    const url = new URL("/login", req.nextUrl);
    if (pathname !== "/main") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (session && isPublic) {
    return NextResponse.redirect(new URL("/main", req.nextUrl));
  }

  // 마스터 전용 경로 (페이지에서도 재검증)
  if (session && pathname.startsWith("/settings") && session.role !== "MASTER") {
    return NextResponse.redirect(new URL("/main", req.nextUrl));
  }

  // 승인자(팀장·마스터) 전용 — 연차현황
  if (
    session &&
    pathname.startsWith("/status") &&
    session.role !== "MASTER" &&
    session.role !== "TEAM_LEAD"
  ) {
    return NextResponse.redirect(new URL("/main", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
