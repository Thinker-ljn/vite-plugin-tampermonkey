import type { Options } from 'tsup'
export const tsup: Options = {
  entryPoints: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
}
