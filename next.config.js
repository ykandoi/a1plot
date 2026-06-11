/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['firebase', '@firebase/app', '@firebase/auth', '@firebase/firestore', '@firebase/storage'],
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
