/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uaxushqdohfrreprmwfp.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/room-images/**",
      },
    ],
  },
  // output: "export",
};

export default nextConfig;
