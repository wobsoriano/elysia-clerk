import type { AuthObject, ClerkClient, ClerkOptions } from '@clerk/backend';
import {
  type AuthenticateRequestOptions,
  type AuthOptions,
  type GetAuthFnNoRequest,
  type RequestState,
} from '@clerk/backend/internal';
import { getAuthObjectForAcceptedToken } from '@clerk/backend/internal';
import { Elysia } from 'elysia';
import { clerkClient } from './clerkClient';
import * as constants from './constants';
import { patchRequest } from './utils';

export type ElysiaClerkOptions = Omit<AuthenticateRequestOptions, 'acceptsToken'>;

type ElysiaClerkContext = {
  auth: GetAuthFnNoRequest;
  clerk: ClerkClient;
  __internal_clerkRequestState: RequestState<any>;
};

function resolveClerkOptions(options?: ElysiaClerkOptions): ClerkOptions {
  return {
    secretKey: options?.secretKey ?? constants.SECRET_KEY,
    publishableKey: options?.publishableKey ?? constants.PUBLISHABLE_KEY,
    apiUrl: options?.apiUrl ?? constants.API_URL,
    apiVersion: options?.apiVersion ?? constants.API_VERSION,
    jwtKey: options?.jwtKey ?? constants.JWT_KEY,
    audience: options?.audience,
    proxyUrl: options?.proxyUrl,
    domain: options?.domain,
    isSatellite: options?.isSatellite,
    sdkMetadata: constants.SDK_METADATA,
    machineSecretKey: options?.machineSecretKey ?? constants.MACHINE_SECRET_KEY,
    telemetry: {
      disabled: constants.TELEMETRY_DISABLED,
      debug: constants.TELEMETRY_DEBUG,
    },
  };
}

export function clerkPlugin(options?: ElysiaClerkOptions) {
  const resolvedClerkOptions = resolveClerkOptions(options);
  const resolvedClerkClient = clerkClient(resolvedClerkOptions);

  return new Elysia({
    name: 'elysia-clerk',
    seed: {
      ...options,
      secretKey: resolvedClerkOptions.secretKey,
      publishableKey: resolvedClerkOptions.publishableKey,
    },
  })
    .decorate('clerk', resolvedClerkClient)
    .resolve(async ({ request }): Promise<ElysiaClerkContext> => {
      const requestState = await resolvedClerkClient.authenticateRequest(patchRequest(request), {
        ...options,
        ...resolvedClerkOptions,
        acceptsToken: 'any',
      });

      // Cast needed: TypeScript cannot verify a single function implementation
      // against GetAuthFnNoRequest's multiple overloads. Runtime correctness is
      // ensured by getAuthObjectForAcceptedToken narrowing based on acceptsToken.
      const auth = ((authOptions?: AuthOptions) => {
        const authObject = requestState.toAuth(authOptions);
        return getAuthObjectForAcceptedToken({
          authObject: authObject as AuthObject,
          acceptsToken: 'any',
        });
      }) as GetAuthFnNoRequest;

      return {
        auth,
        clerk: resolvedClerkClient,
        __internal_clerkRequestState: requestState,
      };
    })
    .onBeforeHandle(({ __internal_clerkRequestState, redirect, set }) => {
      __internal_clerkRequestState.headers.forEach((value, key) => {
        set.headers[key] = value;
      });

      const locationHeader = __internal_clerkRequestState.headers.get('location');
      if (locationHeader) {
        return redirect(locationHeader, 307);
      }

      if (__internal_clerkRequestState.status === 'handshake') {
        throw new Error('Clerk: Unexpected handshake without redirect');
      }
    })
    .as('scoped');
}
