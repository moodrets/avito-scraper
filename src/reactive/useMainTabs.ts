import { ref } from "vue";

export const activeTab = ref<string>('main')

export const changeMainTab = (tabKey: string) => {
    activeTab.value = tabKey
}