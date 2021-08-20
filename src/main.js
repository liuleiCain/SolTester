import {createApp} from 'vue'
import App from './App.vue'
import createRouter from './router'
import router from './router'

const app = createApp(App).use(router)
app.use(createRouter)
app.mount('#app')