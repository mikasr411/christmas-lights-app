/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  webpack: (config) => {
    config.externals.push({
      'opencv-js': 'cv',
    });
    return config;
  },
}

module.exports = nextConfig