/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  experimental: {
    // Enable path mapping for @/ alias
    appDir: true,
  },
}

export default nextConfig
