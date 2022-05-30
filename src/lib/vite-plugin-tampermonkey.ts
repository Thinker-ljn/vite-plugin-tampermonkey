import type { Plugin } from 'vite'
import { injectCssPluginOption } from './build/inject-css'
import { parserGrant } from './tampermonkey/grant'
import { afterServerStart, tampermonkeyRouteMiddleware } from './tampermonkey'
import { clientCodeRouteMiddleware } from './client'
import { forceDevelopmentHmr } from './client/hmr'
import { forceBuildConfig } from './build/config'
import { Options } from './type'

export default function tampermonkeyPlugin(options: Options = {}): Plugin[] {
  const autoGrantModuleParsed =
    options.autoGrant === false ? undefined : parserGrant.moduleParsed
  return [
    {
      name: 'tampermonkey-dev-entry',
      configureServer(server) {
        return () => {
          server.httpServer?.on('listening', () => afterServerStart(server))
          server.middlewares.use(tampermonkeyRouteMiddleware(server))
          server.middlewares.use(clientCodeRouteMiddleware(server))
        }
      },
      moduleParsed: autoGrantModuleParsed,
      config(config) {
        forceDevelopmentHmr(config)
        forceBuildConfig(config, options)
      },
    },
    injectCssPluginOption,
  ]
}
