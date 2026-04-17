import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/topics/anxiety-and-trust",
        destination: "/topics/anxiety",
        permanent: true,
      },
      {
        source: "/paths/anxiety-and-trust",
        destination: "/paths/anxiety",
        permanent: true,
      },
      {
        source: "/topics/identity-in-christ",
        destination: "/topics/identity",
        permanent: true,
      },
      {
        source: "/paths/identity-in-christ",
        destination: "/paths/identity",
        permanent: true,
      },
    ];
  },
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },
      { protocol: "https", hostname: "**.ytimg.com", pathname: "/**" },
      { protocol: "https", hostname: "**.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "**.simplecast.com", pathname: "/**" },
      { protocol: "https", hostname: "**.buzzsprout.com", pathname: "/**" },
      { protocol: "https", hostname: "**.rss.com", pathname: "/**" },
      { protocol: "https", hostname: "**.soundcloud.com", pathname: "/**" },
      { protocol: "https", hostname: "feed.desiringgod.org", pathname: "/**" },
      { protocol: "https", hostname: "**.ligonier.org", pathname: "/**" },
      // Common podcast / RSS CDNs (for next/image if used later)
      { protocol: "https", hostname: "**.libsyn.com", pathname: "/**" },
      { protocol: "https", hostname: "**.amazonaws.com", pathname: "/**" },
      { protocol: "https", hostname: "**.cloudfront.net", pathname: "/**" },
      { protocol: "https", hostname: "**.blubrry.com", pathname: "/**" },
      { protocol: "https", hostname: "**.spreaker.com", pathname: "/**" },
      { protocol: "https", hostname: "**.megaphone.fm", pathname: "/**" },
      { protocol: "https", hostname: "megaphone.imgix.net", pathname: "/**" },
      { protocol: "https", hostname: "**.transistor.fm", pathname: "/**" },
      { protocol: "https", hostname: "albertmohler.com", pathname: "/**" },
      { protocol: "https", hostname: "www.gty.org", pathname: "/**" },
      { protocol: "https", hostname: "gty.org", pathname: "/**" },
      { protocol: "https", hostname: "www.truthforlife.org", pathname: "/**" },
      { protocol: "https", hostname: "thegospelcoalition.org", pathname: "/**" },
      { protocol: "https", hostname: "**.thegospelcoalition.org", pathname: "/**" },
      { protocol: "https", hostname: "corechristianity.org", pathname: "/**" },
      { protocol: "https", hostname: "**.supabase.co", pathname: "/**" },
    ],
  },
};

export default nextConfig;
