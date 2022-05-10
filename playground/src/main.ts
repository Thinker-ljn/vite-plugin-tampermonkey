import { createApp } from 'vue'
import App from './App.vue'
import 'uno.css'

const container = (parent: Element) => {
  const appContainer = document.createElement('div')
  parent.insertBefore(appContainer, parent.firstChild)
  return appContainer
}

const el = container(document.body)

const app = createApp(App)
app.mount(el)
