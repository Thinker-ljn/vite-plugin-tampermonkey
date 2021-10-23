import { grants } from './tampermonkey-grant'

export default function genClientCode({ address, port }: any) {
  return `
const url = 'http://${address}:${port}'

${grants.map((gm) => `unsafeWindow.${gm} = ${gm}`).join('\n')}

function createModuleScript(path) {
  const script = document.createElement('script')
  script.type = 'module'
  script.src = url + '/' + path
  document.body.appendChild(script)
  return script
}

createModuleScript('@vite/client')
createModuleScript('src/main.ts')
`
}
