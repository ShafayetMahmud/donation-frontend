export function getSubdomain(): string {
  const hostname = window.location.hostname; // e.g., save-the-forest.yourdomain.com
  // handle localhost for dev
  if (hostname.includes('localhost')) {
    return 'test-campaign'; // or read from query param for dev
  }
  const parts = hostname.split('.');
  return parts.length > 2 ? parts[0] : ''; // returns first part if subdomain exists
}
