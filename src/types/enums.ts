export enum MessagesEnum {
    // filter
    FilterSaved = 'Фильтр сохранен',
    FilterSaveError = 'Не удалось сохранить фильтр',
    FilterCleared = 'Фильтр сброшен (удален из памяти)',
    // parsing
    ParsingCanceled = 'Парсинг отзывов отменен',
    ParsingStarted = 'Парсинг отзывов начался',
    // tabs
    TabOpenError = 'Не удалось открыть ссылку',
    // profile
    ProfileCreated = 'Профиль добавлен в базу',
    ProfileLinkCopied = 'Ссылка скопирована в буффер',
    ProfileDeleted = 'Профиль успешно удален',

    InfoCopied = 'Информация скопирована в буффер',
    ProductNameCopied = 'Имя товара скопировано в буффер'
}

export enum MainTabsEnum {
    ReviewsFilter = 'reviews_filter',
    ProfileInfoList = 'profile_info_list',
    ProfileSavedList = 'profile_saved_list',
    Settings = 'settings'
}