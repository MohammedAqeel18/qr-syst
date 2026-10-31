
import type { NextConfig } from "next";

const API_SERVER =
  process.env.API_SERVER_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://qr-syst.onrender.com");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_SERVER}/api/:path*`,
      },
    ];
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
