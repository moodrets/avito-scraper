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

    // common
    InfoCopied = 'Информация скопирована в буффер',
    ProductNameCopied = 'Имя товара скопировано в буффер',

    // database
    DBExportError = 'Не удалось экспортировать базу',
    DBExportSuccess = 'Экпорт базы успешно завершен',
    DBImportError = 'Не удалось импортировать базу',
    DBImportSuccess = 'Импорт базы успешно завершен',
    DBDropSuccess = 'База данных успешно удалена',
    DBDropError = 'Не удалось удалить базу данных',
}

export enum MainTabsEnum {
    ReviewsFilter = 'reviews_filter',
    ProfileInfoList = 'profile_info_list',
    ProfileSavedList = 'profile_saved_list',
    Settings = 'settings'
}