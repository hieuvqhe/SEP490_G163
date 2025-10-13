/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vtcpay.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static1.colliderimages.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.hdqwalls.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "image.lag.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.comingsoon.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tse2.mm.bing.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
    ],
    // Thêm configs này
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;