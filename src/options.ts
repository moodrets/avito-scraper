import { createApp } from 'vue'
import { createPinia } from 'pinia';

import 'air-datepicker/air-datepicker.css';
import '@/styles/main.scss'
import App from '@/components/App.vue'

const Pinia = createPinia()

createApp(App)
    .use(Pinia)
    .mount('#options')