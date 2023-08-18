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
            text: 'Парсинг продавцов',
            icon: 'tune',
        },
        {
            value: AppTabsEnum.ProfilesSaved,
            text: 'БД',
            icon: 'people',
        },
    ]

    public changeTab(key: AppTabsEnum) {
        this.active.value = key
    }
}

export const appTabs = new AppTabs()