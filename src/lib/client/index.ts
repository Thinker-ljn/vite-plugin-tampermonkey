import { readFile } from 'fs/promises'
import { grants } from '../tampermonkey/grant'
import { Connect, ViteDevServer } from 'vite'
import { getLocalOrigin, normalizePath } from '../utils'

export const CLIENT_ENTRY = require.resolve('vite-plugin-tampermonkey/client')
const CLIENT_URL = '/@tampermonkey-dev-client.js'
export function genDevTampermonkeyClientUrl(localOrigin: string) {
  return `${localOrigin}${CLIENT_URL}`
}

export async function genDevTampermonkeyClientCode(localOrigin: string) {
  return readFile(normalizePath(CLIENT_ENTRY), 'utf-8').then((code) =>
    code
      .replace('__GRANTS__', `{ ${grants.map((g) => `${g},`).join('')} }`)
      .replace('__ORIGIN__', JSON.stringify(localOrigin))
  )
}

export function clientCodeRouteMiddleware(
  server: ViteDevServer
): Connect.NextHandleFunction {
  return async (req, res, next) => {
    if (req.url === CLIENT_URL) {
      const origin = getLocalOrigin(server)
      const code = await genDevTampermonkeyClientCode(origin)
      res.setHeader('Cache-Control', 'no-store')
      res.write(code)
    }
    next()
  }
}
