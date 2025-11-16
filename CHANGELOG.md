# elysia-clerk

## 0.13.1

### Patch Changes

- d07b60a: Fix auth() return type

## 0.13.0

### Minor Changes

- b92dcdf: Make package ESM only

### Patch Changes

- 3995c20: Migrate @clerk/types import to @clerk/shared/types

## 0.12.2

### Patch Changes

- 72f0d71: Bump `@clerk/backend` to 2.14.0 and `@clerk/shared` to 3.25.0

## 0.12.1

### Patch Changes

- 7dccdee: - Bump `@clerk/backend` to 2.6.2
  - Bump `@clerk/shared` to 3.17.0

## 0.12.0

### Minor Changes

- 3da6f14: Re-export webhook verification helper

  Usage:

  _Required_: Set your `CLERK_WEBHOOK_SIGNING_SECRET` environment variable to protect your webhook signing secret. It is automatically read by `verifyWebhook()`.

  ```ts
  import { clerkPlugin } from "elysia-clerk";
  import { verifyWebhook } from "elysia-clerk/webhooks";

  new Elysia()
    .use(clerkPlugin())
    .get("/webhook", ({ request }) => {
      const result = await verifyWebhook(request);
      // do something with the result
    })
    .listen(3000);
  ```

### Patch Changes

- be91dec: Bump `@clerk/backend` to 2.4.1 and `@clerk/shared` to 3.11.0

## 0.11.0

### Minor Changes

- 1133c3a: Bump `@clerk/backend` to 2.0.0 and prepare for machine auth changes.

## 0.9.10

### Patch Changes

- bef664f: Bump `@clerk/backend` to version 1.31.2 and `@clerk/shared` to version 3.7.8

## 0.9.9

### Patch Changes

- 3ec16f7: Deprecate `context.auth` in favor of `context.auth()` as function

## 0.9.8

### Patch Changes

- ad2a4ef: - Bump `"@clerk/backend` to 1.25.8
  - Bump `"@clerk/shared` to 3.2.3
  - Remove internal imports

## 0.9.7

### Patch Changes

- 1d91b85: Bump `@clerk/backend` to 1.25.5 and `@clerk/shared` to 3.2.0

## 0.9.6

### Patch Changes

- ccff9cc: Bump @clerk/shared from 2.22.0 to 3.0.0

## 0.9.5

### Patch Changes

- 8e54eff: Bump `@clerk/backend` to 1.24.2 and `@clerk/shared` to 2.22.0

## 0.9.4

### Patch Changes

- 270bd23: Bump `@clerk/backend` to 1.24.0 and `@clerk/shared` to 2.21.0

## 0.9.3

### Patch Changes

- cf1ff6b: Bump `@clerk/backend` to 1.23.11 and `@clerk/shared` to 2.20.18

## 0.9.2

### Patch Changes

- 11b6618: Bump @clerk/backend to 1.23.7 and @clerk/shared to 2.20.14

## 0.9.1

### Patch Changes

- ecfeeb3: Bump `@clerk/backend` to 1.21.6 and `@clerk/shared` to 2.20.6

## 0.10.1

### Patch Changes

- 6027a2b: Remove macro feature

## 0.10.0

### Minor Changes

- 67a4944: Add `currentUser` macro to get the [Backend User](https://clerk.com/docs/references/backend/types/backend-user) object of the currently active user.

  Usage:

  ```ts
  new Elysia()
    .use(clerkPlugin())
    .get(
      "/current-user",
      ({ currentUser, error }) => {
        if (!currentUser) {
          return error(401);
        }

        return { currentUser };
      },
      {
        currentUser: true,
      }
    )
    .listen(3000);
  ```

## 0.9.0

### Minor Changes

- 910616c: Support Elysia 1.2.x

## 0.8.8

### Patch Changes

- a3fdb45: Bump @clerk/backend to 1.21.0 and @clerk/shared to 2.20.0

## 0.8.7

### Patch Changes

- 6f1d3b5: Bump `@clerk/backend` to 1.19.0 and `@clerk/shared` to 2.18.0

## 0.8.6

### Patch Changes

- 5d52cd2: Bump @clerk/backend to 1.17.1 and @clerk/shared to 2.16.0

## 0.8.5

### Patch Changes

- d90eabb: Bump @clerk/backend to 1.15.7 and @clerk/shared to 2.11.5

## 0.8.4

### Patch Changes

- f8e1ff8: Bump @clerk/backend to 1.15.6 and @clerk/shared to 2.11.4

## 0.8.3

### Patch Changes

- 7228b74: Bump @clerk/backend to 1.15.0 and @clerk/shared to 2.10.0

## 0.8.2

### Patch Changes

- 2246b5c: Bump `@clerk/backend` to 1.14.1 and `@clerk/shared` to 2.9.2

## 0.8.1

### Patch Changes

- fdc514b: Bump `@clerk/shared` to 2.9.1
- fdc514b: Bump `@clerk/backend` to 1.13.10

## 0.8.0

### Minor Changes

- eaa13f8: Make `enableHandshake` value default to `true` as header based authorization does not support handshake by default anyway.

## 0.7.0

### Minor Changes

- a33d88d: Disable Clerk handshake by default

### Patch Changes

- af95933: Bump `@clerk/backend` to 1.13.2
- dccd3be: Add `@clerk/shared` to dependencies

## 0.6.1

### Patch Changes

- 098c11a: Bump @clerk/backend to 1.11.1

## 0.6.0

### Minor Changes

- 9c3b71c: Remove deprecated auth store

### Patch Changes

- 53e7571: Bump @clerk/backend to 1.9.0"

## 0.5.5

### Patch Changes

- 4c4b12a: Move auth object to resolved properties

  Usage:

  ```ts
  import { Elysia } from "elysia";
  import { clerkPlugin } from "elysia-clerk";

  new Elysia()
    .use(clerkPlugin())
    .get("/api/me", async ({ clerk, auth, set }) => {
      if (!auth?.userId) {
        set.status = 403;
        return "Unauthorized";
      }

      const user = await clerk.users.getUser(auth.userId);

      return { user };
    })
    .listen(3000);
  ```

## 0.5.4

### Patch Changes

- 3f43064: Update usage docs
- 8f72ecc: Bump @clerk/backend to 1.7.0
- e69451a: Fix AuthObject import

## 0.5.3

### Patch Changes

- 82e14da: Remove unused dependency

## 0.5.2

### Patch Changes

- 9856093: Option to opt-out of telemetry
- 7f4fdc3: Bump @clerk/backend to 1.4.3
