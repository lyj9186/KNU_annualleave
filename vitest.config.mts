import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": import.meta.dirname },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
    env: {
      // lib/auth/jwt 테스트용 (실제 배포 키와 무관)
      SESSION_SECRET: "test-session-secret-please-ignore-0123456789",
    },
  },
});
