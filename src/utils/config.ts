// Configuration utilities
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000')
}

// Debug configuration in development
if (config.enableDebug && config.environment === 'development') {
  console.log('🔧 Frontend Configuration:', {
    apiUrl: config.apiUrl,
    environment: config.environment,
    enableDebug: config.enableDebug
  })
}
