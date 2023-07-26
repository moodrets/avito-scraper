import { MainTabsEnum } from "@/types/enums";
import { ref } from "vue";

export const activeTab = ref<MainTabsEnum>(MainTabsEnum.ReviewsFilter)

export const changeMainTab = (tabKey: MainTabsEnum) => {
    activeTab.value = tabKey
}