/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  useFileSystemPublicRoutes: false,
  output: 'export',
  typescript: {
    // @TODO: ignoreBuildErrors
    ignoreBuildErrors: true,
  },
  eslint: {
    // @TODO: ignoreDuringBuilds
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
