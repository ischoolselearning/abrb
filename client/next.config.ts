import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // Tells Next.js to generate static files

  // Required: GitHub Pages handles assets via subdirectories (e.g., username.github.io/repo-name)
  basePath: isProd ? '/client' : '',
  assetPrefix: isProd ? '/client/' : '',

  // Required: GitHub Pages doesn't support Next.js default Image Optimization API
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
