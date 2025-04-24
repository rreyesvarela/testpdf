import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config, { isServer }) {
    // Ignorar archivos .map
    config.module.rules.push({
      test: /\.js\.map$/,
      use: 'ignore-loader', // Ignora los archivos .map
    });

    // Excluir @sparticuz/chrome-aws-lambda del bundle en el servidor
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('@sparticuz/chrome-aws-lambda');
    }

    // Configuración existente para SVGs
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

export default nextConfig;