import { RDToast } from "@/libs/rd-toast/RDToast";
import { getCurrentInstance } from "vue";

export const useToast = (): RDToast | null => {
    const app = getCurrentInstance();
    return app?.appContext.config.globalProperties.$toast
}