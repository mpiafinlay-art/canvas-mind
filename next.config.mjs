/** @type {import('next').NextConfig} */
const nextConfig = {
  // CRÍTICO: Transpilar paquetes ESM para App Hosting
  transpilePackages: [
    'lucide-react',
  ],
  
  // Ignorar errores de TypeScript y ESLint durante build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configuración de imágenes 
  images: {
    unoptimized: true,
  },
  
  // Desactivar strict mode
  reactStrictMode: false,
};

export default nextConfig;
