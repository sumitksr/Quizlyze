/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude pdf-parse from webpack bundling on server side
      // It will only be used in spawned Node.js processes
      config.externals = [...(config.externals || []), 'pdf-parse', 'canvas'];
    }
    return config;
  },
};

export default nextConfig;
