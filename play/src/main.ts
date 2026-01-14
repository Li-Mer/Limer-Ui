import { createApp } from 'vue'
import App from './App.vue'
import LimerUI from 'limer-ui'
import 'limer-ui/dist/index.css'

const app = createApp(App)

app.use(LimerUI)
app.mount('#app')