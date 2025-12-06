// middleware.js
export { default } from './src/middleware/rate-limiter';
export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/library/:path*', '/match/:path*'],
};