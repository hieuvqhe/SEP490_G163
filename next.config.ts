/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "movie-store-wdp301.s3.ap-southeast-1.amazonaws.com",
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
      {
        protocol: "https",
        hostname: "www.themoviedb.org",
        pathname: "/t/p/**",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sm.ign.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.cinemaapp.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        port: "",
        pathname: "/t/p/**", // Cho phép tất cả ảnh poster, backdrop của TMDb
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        port: "",
        pathname: "/**", // Cho phép tất cả đường dẫn từ Wikimedia
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "seeklogo.com",
        port: "",
        pathname: "/**",
      },
      {
        source: "/api/payos/:path*",
        destination:
          "https://expressticketcinemasystemapi-fjescsgjg9djeuf5.southeastasia-01.azurewebsites.net/api/payments/payos/:path*",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
