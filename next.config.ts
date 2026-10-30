import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Use the supported compiler API with the pinned TypeScript 5 toolchain.
  experimental: { useTypeScriptCli: false },
};

export default nextConfig;
