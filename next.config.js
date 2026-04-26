/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    '/api/games-db': ['./public/games.db'],
    '/api/games-db/route': ['./public/games.db'],
    '/app/api/games-db/route': ['./public/games.db'],
  },
};

module.exports = nextConfig;
