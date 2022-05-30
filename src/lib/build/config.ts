import type { UserConfig } from 'vite'
import bannerGen from '../tampermonkey/banner'
import { Options } from '../type'
import {
  gendefaultBuildOptions,
  genRollupOptionsGenerator,
} from './gen-build-options'

export function forceBuildConfig(config: UserConfig, options: Options) {
  if (process.env.NODE_ENV !== 'production') {
    return
  }
  const rollupOptions = genRollupOptionsGenerator(bannerGen)(options)
  config.build = {
    lib: gendefaultBuildOptions(),
    rollupOptions,
    minify: false,
    cssCodeSplit: false,
  }
}
