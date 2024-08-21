import { Elysia } from 'elysia'
import { html } from '@elysiajs/html'
import { clerkPlugin } from '../src'
import innerRoute from './inner-route'

const file = Bun.file(`${import.meta.dir}/index.html`)
const contents = await file.text()

const appFile = Bun.file(`${import.meta.dir}/app.js`)
const appContents = await appFile.text()

export const app = new Elysia()
  .use(html())
  .use(clerkPlugin({}))
  .get('/', () => contents)
  .get('/app.js', () => {
    return appContents.replace('REPLACE_ME', process.env.CLERK_PUBLISHABLE_KEY as string)
  })
  .get('/private', async ({ clerk, set, auth }) => {
    if (!auth?.userId) {
      set.status = 403
      return 'Unauthorized'
    }

    const user = await clerk.users.getUser(auth.userId)

    return { user }
  })
  .use(innerRoute)
  .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
