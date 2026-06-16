/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['firebase', '@firebase/app', '@firebase/auth', '@firebase/firestore', '@firebase/storage'],
  // Tree-shake big barrel-export libraries so the initial bundle is smaller.
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'firebase/app': '@firebase/app',
        'firebase/auth': '@firebase/auth',
        'firebase/firestore': '@firebase/firestore',
        'firebase/storage': '@firebase/storage',
      };
    }
    return config;
  },
};

module.exports = nextConfig;
