const nextConfig = {
  reactStrictMode: true, // Ensures best practices in development
  eslint: {
    ignoreDuringBuilds: true, // Disables ESLint during `npm run build`
  },
  images: {
    domains: ['your-image-source.com'], // Allow external images if needed
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*", // ✅ Fixed wildcard issue
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
        ],
      },
      {
        source: "/_next/app-build-manifest.json",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
