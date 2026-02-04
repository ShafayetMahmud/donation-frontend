// environment.ts (dev)
export const environment = {
  production: false,
  apiBaseUrl: (typeof window !== 'undefined' && window.location.hostname !== 'localhost')
    ? window.location.protocol + '//' + window.location.host + '/api'
    : 'http://localhost:5126/api',
  msalConfig: {
    auth: {
      // clientId: '99d94324-a3a8-4ace-b4b2-0ae093229b62',
      clientId: '9a7bbbc7-dad0-4ef7-841b-b8b45a7605ed',
      authority: 'https://login.microsoftonline.com/8adf6212-f010-45db-b70e-7bc732eb2759', // tenant ID
      redirectUri: 'http://localhost:4200', // Angular base URL
      postLogoutRedirectUri: 'http://localhost:4200'
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: true,
    }
  },
  loginRequest: {
  scopes: ['api://99d94324-a3a8-4ace-b4b2-0ae093229b62/access_as_user']
}

};
