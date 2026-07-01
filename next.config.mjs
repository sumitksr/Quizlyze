/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // canvas is a native addon – keep it external
      // pdf-parse is now imported directly in API routes, so it must be bundled
      config.externals = [...(config.externals || []), 'canvas'];
    }
    return config;
  },
};

export default nextConfig;
