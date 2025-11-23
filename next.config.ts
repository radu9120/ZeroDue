import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sppcarpkmiemokkujwlf.supabase.co', // Your Supabase Storage hostname
        port: '',
        pathname: '/storage/v1/object/public/**', // Adjust this if your bucket path is different
      },
    ],
  },
};

export default nextConfig;
