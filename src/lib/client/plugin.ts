import type { Plugin } from 'vite'
import { clientCodeRouteMiddleware } from '.'
import { afterServerStart, tampermonkeyRouteMiddleware } from '../tampermonkey'
import { forceDevelopmentHmr } from './hmr'

export default function tampermonkeyServePlugin(): Plugin {
  return {
    name: 'tampermonkey-serve-plugin',
    apply: 'serve',
    configureServer(server) {
      return () => {
        server.httpServer?.on('listening', () => afterServerStart(server))
        server.middlewares.use(tampermonkeyRouteMiddleware(server))
        server.middlewares.use(clientCodeRouteMiddleware(server))
      }
    },
    config(config) {
      forceDevelopmentHmr(config)
    },
  }
}
