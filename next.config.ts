import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pg / @prisma/adapter-pg use dynamic requires — keep them out of the bundle.
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
};

export default nextConfig;
