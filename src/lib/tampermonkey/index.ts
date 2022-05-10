import bannerGen from './banner'
import { cyanLog, getLocalOrigin } from '../utils'
import { patchDdevTmConfig } from './grant'
import type { Connect, ViteDevServer } from 'vite'

export const DEV_TAMPERMONKEY_PATH = '/@tampermonkey-dev.user.js'
export function afterServerStart(server: ViteDevServer) {
  const origin = getLocalOrigin(server)
  const msg = `> [Tampermonkey] - click link to install: ${origin}${DEV_TAMPERMONKEY_PATH}`
  cyanLog(msg)
}

export function tampermonkeyRouteMiddleware(
  server: ViteDevServer
): Connect.NextHandleFunction {
  return (req, res, next) => {
    if (req.url === DEV_TAMPERMONKEY_PATH) {
      const origin = getLocalOrigin(server)
      res.write(bannerGen('development', (c) => patchDdevTmConfig(c, origin)))
    }
    next()
  }
}
