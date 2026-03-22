import { createClerkClient, type ClerkOptions } from '@clerk/backend';

import {
  API_URL,
  API_VERSION,
  JWT_KEY,
  SDK_METADATA,
  SECRET_KEY,
  TELEMETRY_DEBUG,
  TELEMETRY_DISABLED,
  MACHINE_SECRET_KEY,
} from './constants';

export function clerkClient(options: ClerkOptions = {}) {
  return createClerkClient({
    secretKey: SECRET_KEY,
    machineSecretKey: MACHINE_SECRET_KEY,
    apiUrl: API_URL,
    apiVersion: API_VERSION,
    jwtKey: JWT_KEY,
    userAgent: `${PACKAGE_NAME}@${PACKAGE_VERSION}`,
    sdkMetadata: SDK_METADATA,
    telemetry: {
      disabled: TELEMETRY_DISABLED,
      debug: TELEMETRY_DEBUG,
      ...options.telemetry,
    },
    ...options,
  });
}
