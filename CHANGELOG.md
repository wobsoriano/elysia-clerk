# elysia-clerk

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
