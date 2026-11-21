import { InjectionToken } from '@angular/core';

export interface HttpFormStoreConfig {
  /** Backend root, e.g. `https://api.example.com` */
  baseUrl: string;
}

export const HTTP_FORM_STORE_CONFIG = new InjectionToken<HttpFormStoreConfig>(
  'HttpFormStoreConfig',
);
