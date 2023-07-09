import { createApp } from 'vue'
import '@/styles/main.scss'
import AppPopup from '@/components/RootPopup.vue'
import OptionsApp from '@/components/RootOptions.vue'
import { RDToastVuePlugin } from '@/reactive/usePlugins'

createApp(AppPopup)
    .use(RDToastVuePlugin)
    .mount('#popup')

createApp(OptionsApp)
    .use(RDToastVuePlugin)
    .mount('#options')