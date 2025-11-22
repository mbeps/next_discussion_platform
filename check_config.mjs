import { createRequire } from 'module';
const require = createRequire(import.meta.url);

try {
  const nextConfig = require('eslint-config-next/core-web-vitals');
  console.log('Type:', typeof nextConfig);
  console.log('Is Array:', Array.isArray(nextConfig));
  console.log('Length:', nextConfig.length);
} catch (e) {
  console.error(e);
}
