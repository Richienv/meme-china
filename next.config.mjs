/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during the build process
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Also ignore TypeScript errors during builds
    ignoreBuildErrors: true,
  },
  // Add other Next.js configuration options as needed
};

export default nextConfig; 