import { ref } from 'vue'

export enum AppTabsEnum {
    ReviewsFilter = 'reviews_filter',
    ParsingResult = 'parsing_result',
    ProfileSavedList = 'profile_saved_list',
    Settings = 'settings'
}

interface IAppTab {
    value: AppTabsEnum,
    text: string,
    icon: string
}

class AppTabs {
    public active = ref<AppTabsEnum>(AppTabsEnum.ReviewsFilter)

    public list: IAppTab[] = [
        {
            value: AppTabsEnum.ReviewsFilter,
            text: 'Фильтр отзывов',
            icon: 'tune'
        },
        {
            value: AppTabsEnum.ParsingResult,
            text: 'Результаты парсинга',
            icon: 'view_list'
        },
        {
            value: AppTabsEnum.ProfileSavedList,
            text: 'Список профилей',
            icon: 'people'
        },
    ]

    public changeTab(key: AppTabsEnum) {
        this.active.value = key
    }
}

export const appTabs = new AppTabs()