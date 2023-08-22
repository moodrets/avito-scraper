import { ref } from 'vue'

export enum AppTabsEnum {
    ProfilesSearch = 'profiles_search',
    ProfilesSaved = 'profiles_saved',
    ProfilesParsing = 'profiles_parsing',
    Settings = 'settings'
}

interface IAppTab {
    value: AppTabsEnum,
    text: string,
    icon: string,
}

class AppTabs {
    public active = ref<AppTabsEnum>(AppTabsEnum.ProfilesSearch)

    public list: IAppTab[] = [
        {
            value: AppTabsEnum.ProfilesSearch,
            text: 'Поиск продавцов',
            icon: 'group_add',
        },
        {
            value: AppTabsEnum.ProfilesParsing,
            text: 'Парсинг',
            icon: 'tune',
        },
        {
            value: AppTabsEnum.ProfilesSaved,
            text: 'БД',
            icon: 'people',
        },
    ]

    public async changeTab(key: AppTabsEnum) {
        this.active.value = key
        chrome.storage.local.set({activeTab: key})
    }

    public async setActiveTabFromStorage() {
        const { activeTab } = await chrome.storage.local.get('activeTab')
        if (activeTab) {
            this.active.value = activeTab
        }
    }
}

export const appTabs = new AppTabs()