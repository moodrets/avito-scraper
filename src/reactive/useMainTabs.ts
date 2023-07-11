import { ref } from "vue";

export const activeTab = ref<string>('filter')

export const changeMainTab = (tabKey: string) => {
    activeTab.value = tabKey
}