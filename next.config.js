/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
  poweredByHeader: false,
  outputFileTracingRoot: __dirname,
  async headers() {
    const development = process.env.NODE_ENV === 'development';
    const policy = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      `script-src 'self' 'unsafe-inline'${development ? " 'unsafe-eval'" : ""}`,
      "connect-src 'self' https://rpc.mainnet.x1.xyz",
    ].join('; ');
    const headers = [
      { key: 'Content-Security-Policy', value: policy },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
    ];
    if (!development) headers.push({ key: 'Strict-Transport-Security', value: 'max-age=31536000' });
    if (process.env.VERCEL_ENV === 'preview') headers.push({ key: 'X-Robots-Tag', value: 'noindex' });
    return [{ source: '/:path*', headers }];
  },
};

module.exports = nextConfig;
