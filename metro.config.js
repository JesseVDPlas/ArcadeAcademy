const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  config.resolver.alias = {
    ...(config.resolver.alias || {}),
    '@': path.resolve(__dirname),
    '@/theme': path.resolve(__dirname, 'theme', 'index.ts'),
  };
  return config;
})(); 