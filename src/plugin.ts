import type { ClerkOptions } from '@clerk/backend';
import type { AuthObject } from '@clerk/backend';
import { AuthStatus } from '@clerk/backend/internal';
import { Elysia } from 'elysia';
import { clerkClient } from './clerkClient';
import * as constants from './constants';

export function clerkPlugin(options?: ClerkOptions) {
	const secretKey = options?.secretKey ?? constants.SECRET_KEY;
	const publishableKey = options?.publishableKey ?? constants.PUBLISHABLE_KEY;

	return new Elysia({
		name: 'clerk',
		seed: options,
	})
		.decorate('clerk', clerkClient)
		.state('auth', null as null | AuthObject)
		.resolve(async ({ request, set, store }) => {
			logWarning(
				'Accessing auth from store will be removed in version 0.6.0. Use the auth property from the context instead.',
			);

			const requestState = await clerkClient.authenticateRequest(request, {
				...options,
				secretKey,
				publishableKey,
			});

			requestState.headers.forEach((value, key) => {
				set.headers[key] = value;
			});

			const auth = requestState.toAuth();

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

			// Remove this in 0.6.0
			store.auth = auth;

			return {
				auth,
			};
		})
		.as('plugin');
}

// Function to log a colored warning
function logWarning(message: string) {
	console.warn(`\x1b[33m⚠️ elysia-clerk: ${message}\x1b[0m`);
}
