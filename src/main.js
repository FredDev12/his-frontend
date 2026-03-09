import { createApp } from "vue"
import { createPinia } from "pinia"

import App from "./App.vue"
import router from "./router"
import { setupErrorFilter } from './utils/errorFilter'
import { setupErrorHandler } from './utils/errorHandler'

import "./style.css"

//setupErrorFilter()
//setupErrorHandler()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount("#app")