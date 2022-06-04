import type { Plugin } from 'vite'
import { Options } from './type'
import tampermonkeyBuildPlugin from './build/plugin'
import tampermonkeyServePlugin from './client/plugin'

export default function tampermonkeyPlugin(options: Options = {}): Plugin[] {
  return [...tampermonkeyBuildPlugin(options), tampermonkeyServePlugin()]
}
