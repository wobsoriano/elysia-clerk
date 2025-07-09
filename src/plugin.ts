import type { ClerkOptions } from '@clerk/backend';
import type {
	SignedInAuthObject,
	SignedOutAuthObject,
} from '@clerk/backend/internal';
import { TokenType } from '@clerk/backend/internal';
import type { PendingSessionOptions } from '@clerk/types';
import { Elysia } from 'elysia';
import { clerkClient } from './clerkClient';
import * as constants from './constants';

export type ElysiaClerkOptions = ClerkOptions;

const HandshakeStatus = 'handshake';
const LocationHeader = 'location';

type SessionAuthObject = SignedInAuthObject | SignedOutAuthObject;

export function clerkPlugin(options?: ClerkOptions) {
	const secretKey = options?.secretKey ?? constants.SECRET_KEY;
	const publishableKey = options?.publishableKey ?? constants.PUBLISHABLE_KEY;

	return new Elysia({
		name: 'elysia-clerk',
		seed: options,
	})
		.decorate('clerk', clerkClient)
		.resolve(async ({ request, set }) => {
			const requestState = await clerkClient.authenticateRequest(request, {
				...options,
				secretKey,
				publishableKey,
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
		})
		.as('scoped');
}
