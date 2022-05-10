# vite-plugin-tampermonkey

基于 `vite` 的 `tampermonkey` 开发构建插件。

## 特点

- 通过 `package.json` 的 `tampermonkey` 属性配置 `tampermonkey` 的头部描述。
- 构建生产时会支持自动分析代码用到的 `grant` ，开发模式则默认导入所有，并且把所有的 `grant` 方法加入到 `unsafeWindow`
- 可通过简单配置，把引入的外部包 `require` 化，自动引入 `unpkg.com` 的 `CDN` ，详情见下面的插件配置

## 使用

```
yarn add vite-plugin-tampermonkey -D
npm install vite-plugin-tampermonkey -D
```

```ts
import { defineConfig } from 'vite'
import tampermonkey from 'vite-plugin-tampermonkey'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tampermonkey({
      externalGlobals: ['vue']
    })
  ],
})
```

## 插件配置

### `externalGlobals`
  
  外部包配置，比如 `vue`，`axios` 等，减少打包体积，并且会自动声明 `require` ，如下配置：

```ts
type ExternalGlobal = Record<string, string> | string[]

const options = {
  externalGlobals: ['vue'],
  // externalGlobals: { vue: 'Vue' }
}

// => 

const rollupOptions = {
  external: ['vue']
  output: {
    globals: {
      vue: 'Vue'
    },
  }
}

// @require           https://unpkg.com/vue@3.2.20

```

### `autoGrant` boolean 类型，默认为 true

  自动分析代码中使用的 `tampermonker` 的 `grant`，并加入声明中

## vite 配置额外说明

生产构建模式将强制配置 `config.build`:

- 入口为 `src/main.js` 或者 `src/main.ts`，由 `vite.config.(j|t)s` 文件决定
- 构建的包名为 `package.json` 的 `name` （**必须填写**）属性的驼峰模式，构建的文件名也与其相关，文件打包格式为 `iife`，不压缩，不分离 `css` 文件。
- 额外配置了 `rollupOptions`，以支持其他功能。

## UnoCSS

如果你有使用 [Unocss](https://github.com/unocss/unocss) 的话，需要把 `UnoCSS` 插件放置在本插件之前，确保在 `UnoCSS` 处理完样式后再由本插件来合并到入口文件内。

```ts
import { defineConfig } from 'vite'
import tampermonkey from 'vite-plugin-tampermonkey'
import Unocss from 'unocss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Unocss(),
    tampermonkey({
      externalGlobals: ['vue']
    })
  ],
})
```

## 禁止CSP(Content-Security-Policy)

在开发模式下，需要通过 `script` 标签注入 `vite` 的脚本，有些网站开启了 `CSP(Content-Security-Policy)`，导致报错，可以安装`Chrome`插件[Disable Content-Security-Policy](https://chrome.google.com/webstore/detail/disable-content-security/ieelmcmcagommplceebfedjlakkhpden)或者[Always Disable Content-Security-Policy](https://chrome.google.com/webstore/detail/always-disable-content-se/ffelghdomoehpceihalcnbmnodohkibj)，来禁止`CSP(Content-Security-Policy)`，**在开发时开启插件即可（其他时间记得关闭以保证网页浏览的安全性）**。

