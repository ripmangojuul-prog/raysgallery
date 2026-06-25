/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This app lives in a subfolder of a larger repo that has its own lockfile;
  // pin the Turbopack workspace root here so file tracing scopes to site-next.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
