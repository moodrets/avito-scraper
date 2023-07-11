import { Plugin } from "vue"
import { RDToast } from "@/libs/rd-toast/RDToast"

export const RDToastVuePlugin: Plugin = {
    install(app){
        app.config.globalProperties.$toast = new RDToast({
            hideOnClick: true,
            position: 'bottom-left'
        })
    }
}