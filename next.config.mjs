/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep Turbopack happy (default in Next.js 16)
  turbopack: {},

  // Externalize packages that use deep subpath imports or native addons.
  // Turbopack resolves these at runtime via Node require() instead of bundling.
  serverExternalPackages: [
    'canvas',
    'pdf-parse',
    '@langchain/textsplitters',
    'chromadb',
    'chromadb-default-embed',
    '@upstash/redis',
    '@upstash/ratelimit',
    'ioredis',
  ],

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas'];
    }
    return config;
  },
};

export default nextConfig;

