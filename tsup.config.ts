import type { Options } from 'tsup'
export const tsup: Options = {
  entryPoints: ['src/index.ts', 'src/lib/client/code.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  external: ['vite-plugin-tampermonkey/client'],
}
