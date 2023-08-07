import { Elysia } from 'elysia';
import type { ClerkOptions, SignedInAuthObject, SignedOutAuthObject } from '@clerk/backend';
export default function clerkPlugin(options: ClerkOptions): Elysia<{
    path: "";
    store: {
        auth: SignedInAuthObject | SignedOutAuthObject | null;
    };
    error: {};
    request: {};
    schema: {};
    meta: {
        schema: {};
        defs: {};
        exposed: {};
    };
}>;
