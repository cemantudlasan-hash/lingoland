
import type {NextConfig} from 'next';

import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;
    // Prevent Three.js from being bundled server-side (it uses browser-only APIs)
    if (isServer) {
      config.externals = [...(config.externals || []), 'three'];
    } else {
      config.resolve.alias['node:fs'] = false;
      config.resolve.alias['node:path'] = false;
      config.resolve.alias['node:https'] = false;
      config.resolve.alias['node:http'] = false;
      config.resolve.alias['node:child_process'] = false;
      config.resolve.alias['node:crypto'] = false;
      config.resolve.alias['node:stream'] = false;
      config.resolve.alias['node:zlib'] = false;

      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        https: false,
        http: false,
        child_process: false,
        crypto: false,
        stream: false,
        zlib: false,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
