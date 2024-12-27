---
"elysia-clerk": minor
---

Add `currentUser` macro for getting the current authenticated user.

Usage:

```ts
new Elysia()
  .use(clerkPlugin())
  .get('/currentUser', ({ currentUser, error }) => {
    return { currentUser }
  }, {
    currentUser: true
  })
  .listen(3000)
```
