import type { AuthObject } from '@clerk/backend';
import {
  type AuthenticateRequestOptions,
  type AuthOptions,
  type GetAuthFnNoRequest,
  TokenType,
} from '@clerk/backend/internal';
import { getAuthObjectForAcceptedToken } from '@clerk/backend/internal';
import { Elysia } from 'elysia';
import { clerkClient } from './clerkClient';
import * as constants from './constants';
import { patchRequest } from './utils';

export type ElysiaClerkOptions = Omit<
  AuthenticateRequestOptions,
  'machineSecretKey' | 'acceptsToken'
>;

export function clerkPlugin(options?: ElysiaClerkOptions) {
  const secretKey = options?.secretKey ?? constants.SECRET_KEY;
  const publishableKey = options?.publishableKey ?? constants.PUBLISHABLE_KEY;

  return new Elysia({
    name: 'elysia-clerk',
    seed: {
      ...options,
      secretKey,
      publishableKey,
    },
  })
    .decorate('clerk', clerkClient)
    .resolve(async ({ request, set }) => {
      const requestState = await clerkClient.authenticateRequest(patchRequest(request), {
        ...options,
        secretKey,
        publishableKey,
        acceptsToken: TokenType.SessionToken,
      });

      requestState.headers.forEach((value, key) => {
        set.headers[key] = value;
      });

      const auth = ((authOptions?: AuthOptions) =>
        getAuthObjectForAcceptedToken({
          authObject: requestState.toAuth(authOptions) as AuthObject,
          acceptsToken: 'any',
        })) as GetAuthFnNoRequest;

      const locationHeader = requestState.headers.get('location');
      if (locationHeader) {
        // Trigger a handshake redirect
        set.status = 307;
        return {
          auth,
        };
      }

      if (requestState.status === 'handshake') {
        throw new Error('Clerk: Unexpected handshake without redirect');
      }

      return {
        auth,
      };
    })
    .as('scoped');
}
