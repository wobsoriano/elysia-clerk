# elysia-clerk

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
