import fs from 'fs'
import path from 'path'
import { Plugin } from 'vite'

const INTRO_FOR_PLACEHOLDER =
  'console.warn("__TEMPLATE_INJECT_CSS_PLACEHOLDER_NOT_WORK__")'
const genIntro = (input?: string) =>
  INTRO_FOR_PLACEHOLDER + (input ? '\n' + input : '')
export function genRollupIntro(
  userDefine?: string | (() => string | Promise<string>)
) {
  return () => {
    if (!userDefine) return genIntro()
    if (typeof userDefine === 'string') {
      return genIntro(userDefine)
    }
    const res = userDefine()
    if (typeof res === 'string') {
      return genIntro(res)
    }
    return res.then((final) => genIntro(final))
  }
}

const GM_ADD_STYLE = 'GM_addStyle'
export const addExtraTmGrant = (tmConfig: Record<string, any>) => {
  if (!tmConfig.grant) {
    tmConfig.grant = []
  }
  if (!tmConfig.grant.find((grant: string) => grant === GM_ADD_STYLE)) {
    tmConfig.grant.push(GM_ADD_STYLE)
  }
  return tmConfig
}

const allCss: string[] = []
export const injectCssPluginOption: Plugin = {
  name: 'inject-css',
  transform(code: string, id: string) {
    if (/\.(c|le|sc)ss$/.test(id)) {
      allCss.push(code)
      return {
        code: '',
      }
    }
  },
  async writeBundle({ dir }, bundle) {
    for (const fileName of Object.keys(bundle)) {
      const dist = dir || path.resolve(process.cwd(), 'dist')
      const filePath: string = path.resolve(dist, fileName)

      try {
        fs.writeFileSync(
          filePath,
          fs
            .readFileSync(filePath, 'utf-8')
            .replace(
              INTRO_FOR_PLACEHOLDER,
              allCss.length
                ? `${GM_ADD_STYLE}(${['`', ...allCss, '`'].join('\n')})`
                : ''
            )
        )
      } catch (e) {
        console.error(e)
      }
    }
  },
}
