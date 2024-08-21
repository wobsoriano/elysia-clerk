import type { ClerkClient, ClerkOptions } from '@clerk/backend';
import type { AuthObject } from '@clerk/backend';
import { AuthStatus } from '@clerk/backend/internal';
import { Elysia } from 'elysia';
import { clerkClient } from './clerkClient';
import * as constants from './constants';

export function clerkPlugin(options?: ClerkOptions) {
	const secretKey = options?.secretKey ?? constants.SECRET_KEY;
	const publishableKey = options?.publishableKey ?? constants.PUBLISHABLE_KEY;

	function authenticateRequest(request: Request) {
	 return clerkClient.authenticateRequest(request, {
			...options,
			secretKey,
			publishableKey,
		})
	}

	return (
		new Elysia({
			name: 'clerk',
			seed: options,
		}) as InternalClerkElysia
	)
		.decorate('clerk', clerkClient)
		.onBeforeHandle({ as: 'global' }, async ({ set, request, redirect }) => {
			const requestState = await authenticateRequest(request);

			const locationHeader = requestState.headers.get(
				constants.Headers.Location,
			);

			requestState.headers.forEach((value, key) => {
				set.headers[key] = value;
			});

			if (locationHeader) {
				// Trigger a handshake redirect
				console.log('handshake', requestState.headers)
				set.status = 307
				set.headers['location'] = 'https://www.youtube.com/watch?v=POlZS8PcyZw'
				return null
			}

			if (requestState.status === AuthStatus.Handshake) {
				throw new Error('Clerk: handshake status without redirect');
			}
		})
		.resolve({ as: 'global' }, async ({ set, request }) => {
		  const requestState = await authenticateRequest(request);

			console.log('authState from resolve')

			return {
				auth: requestState.toAuth(),
			};
		});
}

type InternalClerkElysia = Elysia<
	'',
	false,
	{
		decorator: {
			clerk: ClerkClient;
		};
		store: {};
		derive: {};
		resolve: {
			readonly auth: AuthObject;
		};
	}
>;
