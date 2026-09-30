import routing from './lib/public-routes.cjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  agentRules: false,
  allowedDevOrigins: ['127.0.0.1'],
  async redirects() {
    return [
      ...Object.entries(routing.contentRoutes).map(([destination, route]) => ({
        source: '/' + route,
        destination,
        permanent: true,
      })),
      { source: '/admin.html', destination: '/admin', permanent: true },
    ];
  },
};

export default nextConfig;
