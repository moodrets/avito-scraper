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
    Filter = 'filter',
    ReviewsResult = 'reviews_list',
    ProfileList = 'profile_list',
    Settings = 'settings'
}