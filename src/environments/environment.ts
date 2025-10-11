// environment.ts (dev)
export const environment = {
  production: false,
  apiBaseUrl: (typeof window !== 'undefined' && window.location.hostname !== 'localhost')
    ? window.location.protocol + '//' + window.location.host + '/api'
    : 'http://localhost:5126/api'
};
