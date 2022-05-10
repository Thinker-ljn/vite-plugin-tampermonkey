import type { UserConfig } from 'vite'
import bannerGen from '../tampermonkey/banner'
import {
  ExternalGlobal,
  gendefaultBuildOptions,
  genRollupOptionsGenerator,
} from './gen-build-options'

export function forceBuildConfig(
  config: UserConfig,
  externalGlobals?: ExternalGlobal
) {
  if (process.env.NODE_ENV !== 'production') {
    return
  }
  const rollupOptions = genRollupOptionsGenerator(bannerGen)(externalGlobals)
  config.build = {
    lib: gendefaultBuildOptions(),
    rollupOptions,
    minify: false,
    cssCodeSplit: false,
  }
}
