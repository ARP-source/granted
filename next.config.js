/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Required for Zeabur: expose env to client components (safely)
  env: {
    TOKENROUTER_API_KEY: process.env.TOKENROUTER_API_KEY,
  },
  // Optional: enable static exports if needed later
  // output: 'export',
};

module.exports = nextConfig;
