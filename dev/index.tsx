import { Elysia } from 'elysia'
import { html } from '@elysiajs/html'
import { clerkPlugin } from '../src'
import innerRoute from './inner-route'

const file = Bun.file(`${import.meta.dir}/index.html`)
const contents = await file.text()

const appFile = Bun.file(`${import.meta.dir}/app.js`)
const appContents = await appFile.text()

export const app = new Elysia()
  .onError(({ code, error }) => {
    console.error(code, error)
  })
  .use(clerkPlugin())
  .use(html())
  .get('/', () => contents)
  .get('/app.js', () => {
    return appContents.replace('REPLACE_ME', process.env.CLERK_PUBLISHABLE_KEY as string)
  })
  .get('/private', async ({ set, auth, clerk }) => {
    if (!auth?.userId) {
      set.status = 403
      return 'Unauthorized'
    }

    const user = await clerk.users.getUser(auth.userId)

    return {
      user
    }
  })
  .use(innerRoute)
  .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
