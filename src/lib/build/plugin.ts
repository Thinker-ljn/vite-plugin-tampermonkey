import type { Plugin } from 'vite'
import { parserGrant } from '../tampermonkey/grant'
import { Options } from '../type'
import { forceBuildConfig } from './config'
import { tampermonkeyCssPlugin } from './inject-css'

export default function tampermonkeyBuildPlugin(
  options: Options = {}
): Plugin[] {
  const autoGrantModuleParsed =
    options.autoGrant === false ? undefined : parserGrant.moduleParsed
  return [
    {
      name: 'tampermonkey-build-plugin',
      apply: 'build',
      moduleParsed: autoGrantModuleParsed,
      config(config) {
        forceBuildConfig(config, options)
      },
    },
    tampermonkeyCssPlugin,
  ]
}
