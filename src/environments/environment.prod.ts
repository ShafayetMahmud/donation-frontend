export const environmentOld = {
  production: true,
  // apiBaseUrl: window.location.protocol + '//' + window.location.host + '/api',  // Dynamic based on current domain
  apiBaseUrl: 'https://mudhammataan-api.azurewebsites.net/api',
  allowedFrontendDomains: ['*'],
  msalConfig: {
    auth: {
      // clientId: '99d94324-a3a8-4ace-b4b2-0ae093229b62',
      clientId: '9a7bbbc7-dad0-4ef7-841b-b8b45a7605ed',
      authority: 'https://login.microsoftonline.com/8adf6212-f010-45db-b70e-7bc732eb2759', // tenant ID
      redirectUri: 'https://mudhammataan.com', // Angular base URL
      postLogoutRedirectUri: 'https://mudhammataan.com'
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false,
    }
  },
  
  loginRequest: {
  scopes: ['api://99d94324-a3a8-4ace-b4b2-0ae093229b62/access_as_user']
}

};

export const environment = {
  production: true,
  apiBaseUrl: window.location.protocol + '//' + window.location.host + '/api',
  msalConfig: {
    auth: {
      // clientId: '99d94324-a3a8-4ace-b4b2-0ae093229b62',
      clientId: '9a7bbbc7-dad0-4ef7-841b-b8b45a7605ed',
      authority: 'https://login.microsoftonline.com/8adf6212-f010-45db-b70e-7bc732eb2759', // tenant ID
      redirectUri: 'https://mudhammataan.com', // Angular base URL
      postLogoutRedirectUri: 'https://mudhammataan.com'
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false,
    }
  },
  loginRequest: {
  scopes: ['api://99d94324-a3a8-4ace-b4b2-0ae093229b62/access_as_user']
}

};
