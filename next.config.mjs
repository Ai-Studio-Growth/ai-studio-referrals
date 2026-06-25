/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Referral redirects are designed to run at the edge; conversion tracking is async.
  async headers() {
    return [
      {
        source: '/r/:code',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, s-maxage=60, stale-while-revalidate=600' }],
      },
    ];
  },
};

export default nextConfig;
