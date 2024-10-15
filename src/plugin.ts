import type { ClerkOptions } from '@clerk/backend';
import { AuthStatus } from '@clerk/backend/internal';
import { Elysia } from 'elysia';
import { clerkClient } from './clerkClient';
import * as constants from './constants';

export type ElysiaClerkOptions = ClerkOptions;

export function clerkPlugin(options?: ElysiaClerkOptions) {
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
			});

			const auth = requestState.toAuth();

			requestState.headers.forEach((value, key) => {
				set.headers[key] = value;
			});

			const locationHeader = requestState.headers.get(
				constants.Headers.Location,
			);
			if (locationHeader) {
				// Trigger a handshake redirect
				set.status = 307;
				return {
					auth,
				};
			}

			if (requestState.status === AuthStatus.Handshake) {
				throw new Error('Clerk: handshake status without redirect');
			}

			return {
				auth,
			};
		})
		.as('plugin');
}
