import { createClerkClient } from '@clerk/backend';
import pkg from '../package.json';

import { API_URL, API_VERSION, JWT_KEY, SDK_METADATA, SECRET_KEY } from './constants';

export const clerkClient = createClerkClient({
  secretKey: SECRET_KEY,
  apiUrl: API_URL,
  apiVersion: API_VERSION,
  jwtKey: JWT_KEY,
  userAgent: `${pkg.name}@${pkg.version}`,
  sdkMetadata: SDK_METADATA,
});
