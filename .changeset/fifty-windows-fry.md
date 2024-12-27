---
"elysia-clerk": minor
---

Add `currentUser` macro to get the [Backend User](https://clerk.com/docs/references/backend/types/backend-user) object of the currently active user.

Usage:

```ts
new Elysia()
  .use(clerkPlugin())
  .get('/current-user', ({ currentUser, error }) => {
    if (!currentUser) {
      return error(401)
    }

    return { currentUser }
  }, {
    currentUser: true
  })
  .listen(3000)
```
