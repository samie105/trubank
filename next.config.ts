// Add this to your existing next.config.mjs file
const nextConfig = {
  // Your existing configuration...
  
  images: {
    domains: [
      // Your existing domains...
      'velofilestore.blob.core.windows.net',
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

export default nextConfig;

