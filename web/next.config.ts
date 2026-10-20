import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL ?? "http://127.0.0.1:3000"}/:path*`,
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
