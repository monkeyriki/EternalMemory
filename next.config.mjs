/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Transport security (effective on HTTPS deployments)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload"
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(self), interest-cohort=()"
          }
        ]
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uqydusnfnltwntnjjedz.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**"
      }
    ]
  }
};

export default nextConfig;
