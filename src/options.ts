import { createApp } from 'vue'
import 'air-datepicker/air-datepicker.css';
import '@/styles/main.scss'
import App from '@/components/App.vue'
import { RDToastVuePlugin } from '@/reactive/usePlugins'

createApp(App)
    .use(RDToastVuePlugin)
    .mount('#options')