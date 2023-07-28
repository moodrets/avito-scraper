export enum MessagesEnum {
    // filter
    FilterSaved = 'Фильтр сохранен',
    FilterSaveError = 'Не удалось сохранить фильтр',
    FilterCleared = 'Фильтр сброшен (удален из памяти)',
    // parsing
    ParsingCanceled = 'Парсинг отзывов отменен',
    ParsingStarted = 'Парсинг отзывов запущен',
    // tabs
    TabOpenError = 'Не удалось открыть ссылку',
    // profile
    ProfileCreated = 'Профиль добавлен в базу',
    ProfileCreateError = 'Не удалось сохранить профиль в базу',
    ProfileEdited = 'Профиль успешно обновлен',
    ProfileEditeError = 'Не удалось обновить профиль',
    ProfileDeleted = 'Профиль успешно удален',
    ProfileDeleteError = 'Не удалось удалить профиль',
    ProfileLinkCopied = 'Ссылка скопирована в буффер',

    // common
    InfoCopied = 'Информация скопирована в буффер',
    ProductNameCopied = 'Название товара скопировано в буффер',

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
    ParsingResult = 'parsing_result',
    ProfileSavedList = 'profile_saved_list',
    Settings = 'settings'
}