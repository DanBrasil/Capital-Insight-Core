import type { AuthenticatedUser, FeatureFlag } from './auth.types';

interface TenantConfig {
  features?: FeatureFlag[];
  [key: string]: unknown;
}

interface TenantRequestData {
  id: string;
  name: string;
  isActive: boolean;
  config: TenantConfig;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
    tenant?: TenantRequestData;
  }
}

export {};
