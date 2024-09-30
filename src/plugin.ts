import type { ClerkOptions } from '@clerk/backend';
import { AuthStatus } from '@clerk/backend/internal';
import { Elysia } from 'elysia';
import { clerkClient } from './clerkClient';
import * as constants from './constants';

export type ElysiaClerkOptions = ClerkOptions & {
	/**
	 * Enables Clerk's handshake flow, which helps verify the session state
	 * when a session JWT has expired. It issues a 307 redirect to refresh
	 * the session JWT if the user is still logged in.
	 *
	 * This is useful for server-rendered fullstack applications to handle
	 * expired JWTs securely and maintain session continuity.
	 *
	 * @default true
	 */
	enableHandshake?: boolean;
};

export function clerkPlugin(options?: ElysiaClerkOptions) {
	const secretKey = options?.secretKey ?? constants.SECRET_KEY;
	const publishableKey = options?.publishableKey ?? constants.PUBLISHABLE_KEY;
	const enableHandshake = options?.enableHandshake ?? true;

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

			if (enableHandshake) {
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
			}

			return {
				auth,
			};
		})
		.as('plugin');
}
