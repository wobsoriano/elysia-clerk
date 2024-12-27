# elysia-clerk

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
