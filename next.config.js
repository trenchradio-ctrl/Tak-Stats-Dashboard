/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    '/api/games-db': ['./public/games.db'],
  },
};

module.exports = nextConfig;
