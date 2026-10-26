import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets `npm run build` run beside a live `next dev` without clobbering its .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
