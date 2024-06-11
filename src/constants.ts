import { constants } from '@clerk/backend/internal';
import { apiUrlFromPublishableKey } from '@clerk/shared/apiUrlFromPublishableKey';
import pkg from '../package.json';

export const API_VERSION = process.env.CLERK_API_VERSION || 'v1';
export const SECRET_KEY = process.env.CLERK_SECRET_KEY || '';
export const PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY || '';
export const API_URL = process.env.CLERK_API_URL || apiUrlFromPublishableKey(PUBLISHABLE_KEY);
export const JWT_KEY = process.env.CLERK_JWT_KEY || '';
export const SDK_METADATA = {
  name: pkg.name,
  version: pkg.version,
  environment: process.env.NODE_ENV,
};

export const { Cookies, Headers } = constants;
