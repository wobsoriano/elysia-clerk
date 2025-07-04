import type {
	AuthenticateRequestOptions,
	SignedInAuthObject,
	SignedOutAuthObject,
} from '@clerk/backend/internal';
import { TokenType } from '@clerk/backend/internal';
import type { PendingSessionOptions } from '@clerk/types';
import { Elysia } from 'elysia';
import { clerkClient } from './clerkClient';
import * as constants from './constants';

type SecretKeyOrFn = string | (() => string);

export type ElysiaClerkOptions = Omit<
	AuthenticateRequestOptions,
	'acceptsToken' | 'secretKey' | 'publishableKey'
> & {
	secretKey?: SecretKeyOrFn;
	publishableKey?: SecretKeyOrFn;
	debug?: boolean;
};

type SessionAuthObject = SignedInAuthObject | SignedOutAuthObject;

const HandshakeStatus = 'handshake';
const LocationHeader = 'location';

export function clerkPlugin(options: ElysiaClerkOptions = {}) {
	const rawSecretKey = options?.secretKey ?? constants.SECRET_KEY;
	const rawPublishableKey = options?.publishableKey ?? constants.PUBLISHABLE_KEY;
	const debug = options?.debug || false;

	return new Elysia({
		name: 'elysia-clerk',
		seed: options,
	})
		.decorate('clerk', clerkClient)
		.resolve(async ({ request, set }) => {
			try {
				const requestState = await clerkClient.authenticateRequest(request, {
					...options,
					secretKey: typeof rawSecretKey === 'function' ? rawSecretKey() : rawSecretKey,
					publishableKey: typeof rawPublishableKey === 'function' ? rawPublishableKey() : rawPublishableKey,
					acceptsToken: TokenType.SessionToken,
				});

				const auth = (options?: PendingSessionOptions) =>
					requestState.toAuth(options) as SessionAuthObject;

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
		.as('scoped');
}
