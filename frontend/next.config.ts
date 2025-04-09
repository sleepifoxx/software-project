import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "file4.batdongsan.com.vn",
      },
    ],
  },
}



export default nextConfig;
