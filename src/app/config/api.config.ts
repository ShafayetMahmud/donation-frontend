// src/app/config/api.config.ts
import { environment } from '../../environments/environment';

export const API_ENDPOINTS = {
  donate: {
    wallet: `${environment.apiBaseUrl}/donate/wallet`,
    history: `${environment.apiBaseUrl}/donate/history`,
  },
  user: {
    login: `${environment.apiBaseUrl}/user/login`,
    profile: `${environment.apiBaseUrl}/user/profile`,
  },
  // Add more modules as needed
};
