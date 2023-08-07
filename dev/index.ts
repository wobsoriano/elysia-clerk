import { Elysia } from 'elysia'
import { html } from '@elysiajs/html'
import { clerkPlugin } from '../src'

const file = Bun.file(`${import.meta.dir}/index.html`)
const contents = await file.text()

const appFile = Bun.file(`${import.meta.dir}/app.js`)
const appContents = await appFile.text()

const subset = new Elysia({ prefix: '/api' })
  .use(clerkPlugin({}))
  .get('/auth', async (context) => {
    return context.store.auth
  })

const app = new Elysia()
  .use(html())
  .use(clerkPlugin({}))
  .get('/', () => contents)
  .get('/app.js', () => {
    return appContents.replace('REPLACE_ME', process.env.CLERK_PUBLISHABLE_KEY as string)
  })
  .get('/auth', async (context) => {
    return context.store.auth
  })
  .use(subset)
  .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
