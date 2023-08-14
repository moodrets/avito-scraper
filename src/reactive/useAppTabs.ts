import { ref } from 'vue'

export enum AppTabsEnum {
    ProfilesFilter = 'profile_parsing',
    ReviewsFilter = 'reviews_filter',
    ParsingResult = 'parsing_result',
    ProfileSavedList = 'profile_saved_list',
    Settings = 'settings'
}

interface IAppTab {
    value: AppTabsEnum,
    text: string,
    icon: string,
}

class AppTabs {
    public active = ref<AppTabsEnum>(AppTabsEnum.ProfilesFilter)

    public list: IAppTab[] = [
        {
            value: AppTabsEnum.ProfilesFilter,
            text: 'Поиск продавцов',
            icon: 'group_add',
        },
        {
            value: AppTabsEnum.ReviewsFilter,
            text: 'Парсинг',
            icon: 'tune',
        },
        {
            value: AppTabsEnum.ParsingResult,
            text: 'Результаты',
            icon: 'view_list',
        },
        {
            value: AppTabsEnum.ProfileSavedList,
            text: 'БД',
            icon: 'people',
        },
    ]

    public changeTab(key: AppTabsEnum) {
        this.active.value = key
    }
}

export const appTabs = new AppTabs()