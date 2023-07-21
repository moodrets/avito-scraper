import { MainTabsEnum } from "@/types/enums";
import { ref } from "vue";

export const activeTab = ref<MainTabsEnum>(MainTabsEnum.Filter)

export const changeMainTab = (tabKey: MainTabsEnum) => {
    activeTab.value = tabKey
}