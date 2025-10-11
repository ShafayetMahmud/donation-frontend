export const environment = {
  production: true,
  apiBaseUrl: window.location.protocol + '//' + window.location.host + '/api',  // Dynamic based on current domain
  allowedFrontendDomains: ['*']
};
