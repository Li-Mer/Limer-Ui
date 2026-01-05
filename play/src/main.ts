import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import LimerUI from 'limer-ui'

const app = createApp(App)

app.use(LimerUI)
app.mount('#app')