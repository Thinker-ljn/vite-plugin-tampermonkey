import type { AddressInfo } from 'net'
import type { Plugin } from 'vite'
import bannerGen from './gen-banner'
import {
  ExternalGlobal,
  gendefaultBuildOptions,
  genRollupOptionsGenerator,
} from './gen-build-options'
import { injectCssPluginOption } from './inject-css'
import { addUsedGrants, parserGrant } from './tampermonkey-grant'
import genClientCodeTemplate from './client-code.mustache'

interface Options {
  externalGlobals?: ExternalGlobal
  autoGrant?: boolean
}

function genDevTampermonkeyCode(address: AddressInfo) {
  const banners = bannerGen('development', (c) => addUsedGrants(c, true))
  return `${banners}
  (function () {
    ${genClientCodeTemplate(address)}
  })()`
}

function getAddress(
  address: string | AddressInfo | null | undefined
): AddressInfo | null {
  return address && typeof address === 'object' ? address : null
}

export const DEV_TAMPERMONKEY_PATH = '/@tampermonkey-dev.user.js'
const cyanColor = '\x1B[36m%s\x1B[0m'
export default function tampermonkeyPlugin(options: Options = {}): Plugin[] {
  const autoGrantModuleParsed =
    options.autoGrant === false ? undefined : parserGrant.moduleParsed
  return [
    {
      name: 'tampermonkey-dev-entry',
      configureServer(server) {
        return () => {
          server.httpServer?.on('listening', () => {
            const address = getAddress(server.httpServer?.address())

            if (address) {
              setTimeout(() => {
                console.log(
                  cyanColor,
                  `> [Tampermonkey] - click link to install: http://${address.address}:${address.port}${DEV_TAMPERMONKEY_PATH}`
                )
              })
            }
          })
          server.middlewares.use((req, res, next) => {
            if (req.url === DEV_TAMPERMONKEY_PATH) {
              const address = getAddress(server.httpServer?.address())
              if (address) {
                res.write(genDevTampermonkeyCode(address))
              } else {
                res.write('应该不会出现这种情况...')
              }
            }
            next()
          })
        }
      },
      moduleParsed: autoGrantModuleParsed,
      config(config) {
        // development
        let hmr = config.server?.hmr
        if (typeof hmr === 'boolean' || !hmr) {
          hmr = {}
        }
        // 强制 hrm 指向 ws://127.0.0.1
        hmr.protocol = 'ws'
        hmr.host = '127.0.0.1'
        config.server = {
          ...(config.server || {}),
          hmr,
        }

        // production
        const rollupOptions = genRollupOptionsGenerator(bannerGen)(
          options.externalGlobals
        )
        config.build = {
          lib: gendefaultBuildOptions(),
          rollupOptions,
          minify: false,
          cssCodeSplit: false,
        }
      },
    },
    injectCssPluginOption,
  ]
}
