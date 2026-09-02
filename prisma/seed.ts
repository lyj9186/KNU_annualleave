/**
 * 초기 마스터 계정 생성.
 *   npm run db:seed
 * 환경변수로 값 지정 가능: SEED_MASTER_ID / SEED_MASTER_PW / SEED_MASTER_NAME
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL 이 설정되지 않았습니다. .env 를 확인하세요.");
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const loginId = process.env.SEED_MASTER_ID ?? "master";
  const password = process.env.SEED_MASTER_PW ?? "master1234";
  const name = process.env.SEED_MASTER_NAME ?? "마스터";

  const existing = await db.user.findUnique({ where: { loginId } });
  if (existing) {
    console.log(`이미 '${loginId}' 계정이 존재합니다. 아무 작업도 하지 않습니다.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const year = new Date().getUTCFullYear();

  await db.user.create({
    data: {
      loginId,
      name,
      passwordHash,
      role: "MASTER",
      status: "ACTIVE",
      // 마스터는 연차를 사용하지 않는다 (결재·계정관리 전용).
      balances: { create: { year, grantedDays: 0, adjustDays: 0 } },
    },
  });

  console.log("──────────────────────────────────────");
  console.log(" 마스터 계정을 생성했습니다.");
  console.log(`   아이디  : ${loginId}`);
  console.log(`   비밀번호: ${password}`);
  console.log(" 로그인 후 반드시 비밀번호를 변경하세요.");
  console.log("──────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
