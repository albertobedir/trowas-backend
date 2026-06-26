import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "res.cloudinary.com",
      "i.pravatar.cc",
      "trowas-mobil.s3.us-east-2.amazonaws.com",
    ],
  },
};

export default nextConfig;
