/** @type {import('next').NextConfig} */
const nextConfig = {
  //output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    serverActions: true,
    appDir: true,
    missingSuspenseWithCSRBailout: false,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /node_modules\/undici\/lib\/web\/fetch\/util\.js$/,
      loader: 'string-replace-loader',
      options: {
        search: /if \(typeof this !== 'object' \|\| this === null \|\| !\(#target in this\)\)/,
        replace: 'if (typeof this !== "object" || this === null || !target)',
      },
    });
    return config;
  },
};

module.exports = nextConfig;