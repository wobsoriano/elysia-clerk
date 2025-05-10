import type { ClerkOptions } from '@clerk/backend';
import { deprecated } from '@clerk/shared/deprecated';
import { Elysia } from 'elysia';
import { clerkClient } from './clerkClient';
import * as constants from './constants';

export type ElysiaClerkOptions = Omit<ClerkOptions, "publishableKey" | "secretKey"> & {
	secretKey: ClerkOptions["secretKey"] | (() => string)
	publishableKey: ClerkOptions["publishableKey"] | (() => string)
	debug?: boolean
};

function cloneRequestForAuthentication(request: Request): Request {
  const headers = new Headers();
  request.headers.forEach((value, key) => headers.set(key, value));
  
  return new Request(request.url, {
    method: request.method,
    headers,
    credentials: 'include',
    mode: request.mode,
    redirect: request.redirect
  });
}

const HandshakeStatus = 'handshake';
const LocationHeader = 'location';

export function clerkPlugin(options?: ElysiaClerkOptions) {
	const rawSecretKey = options?.secretKey ?? constants.SECRET_KEY;
	const rawPublishableKey = options?.publishableKey ?? constants.PUBLISHABLE_KEY;
	const debug = options?.debug || false

	return new Elysia({
		name: 'elysia-clerk',
		seed: options,
	})
		.decorate('clerk', clerkClient)
		.resolve(async ({ request: rawRequest, headers: rawHeaders, set }) => {
			const secretKey = typeof rawSecretKey === 'function' ? rawSecretKey() : rawSecretKey;
			const publishableKey = typeof rawPublishableKey === 'function' ? rawPublishableKey() : rawPublishableKey;
			
			if (debug) {
			  console.log('[Clerk] Starting authentication with options:', {
			    hasSecretKey: !!secretKey,
			    hasPublishableKey: !!publishableKey,
			    debug: true
			  });
			  console.log('[Clerk] Original request headers:', Object.fromEntries(rawRequest.headers.entries()));
			}
			
			const request = cloneRequestForAuthentication(rawRequest);
			
			if (debug) {
			  console.log('[Clerk] Cloned request headers:', Object.fromEntries(request.headers.entries()));
			  console.log('[Clerk] Cloned request properties:', {
			    url: request.url,
			    method: request.method,
			    credentials: request.credentials,
			    mode: request.mode
			  });
			}
			
			try {
			  const requestState = await clerkClient.authenticateRequest(request, {
			    ...options,
			    secretKey,
			    publishableKey,
			  });
			  
			  if (debug) {
			    console.log('[Clerk] Authentication result:', {
			      status: requestState.status,
			      isSignedIn: requestState.toAuth()?.sessionId !== null,
			      headers: Array.from(requestState.headers.entries())
			    });
			  }
			  
			  const authObject = requestState.toAuth();
			  const authHandler = () => authObject;

			  const auth = new Proxy(Object.assign(authHandler, authObject), {
				  get(target, prop: string, receiver) {
					  deprecated(
						  'context.auth',
						  'Use `context.auth()` as a function instead.',
					  );

					  return Reflect.get(target, prop, receiver);
				  },
			  });

			  requestState.headers.forEach((value, key) => {
				set.headers[key] = value;
			  });

			  const locationHeader = requestState.headers.get(LocationHeader);
			  if (locationHeader) {
				// Trigger a handshake redirect
				set.status = 307;
				return {
					auth,
				};
			  }

			  if (requestState.status === HandshakeStatus) {
				throw new Error('Clerk: handshake status without redirect');
			  }

			  return {
				auth,
			  };
			} catch (error) {
			  if (debug) {
			    console.error('[Clerk] Authentication error:', error);
			  }
			  throw error;
			}
		})
		.as('plugin');
}
