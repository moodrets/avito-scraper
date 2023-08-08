export enum MessagesEnum {
    // filter
    ReviewsFilterSaved = 'Фильтр сохранен',
    ReviewsFilterSaveError = 'Не удалось сохранить фильтр',
    ReviewsFilterCleared = 'Фильтр сброшен (удален из базы)',
    ReviewsFilterClearError = 'Не удалось удалить фильтр из базы',
    ReviewsFilterGetError = 'Не удалось достать фильтр из базы',
    ReviewsFilterAllLinksParsed = 'Все ссылки уже прошли парсинг',
    ReviewsFilterSimilarLinks = 'В фильтре присутствуют одинаковые ссылки',
    // parsing
    ParsingReviewsCanceled = 'Парсинг отзывов отменен',
    ParsingReviewsStarted = 'Парсинг отзывов запущен',
    ParsingReviewsFinished = 'Парсинг отзывов завершен',
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
    ResultsNotFound = 'Результаты не найдены',
    ProductNameCopied = 'Название товара скопировано в буффер',
    WaitOpenPage = 'Ожидаем открытия следующей страницы ...',
    // database
    DBExportSuccess = 'Экпорт базы успешно завершен',
    DBExportError = 'Не удалось экспортировать базу',
    DBImportError = 'Не удалось импортировать базу',
    DBImportSuccess = 'Импорт базы успешно завершен',
    DBDropSuccess = 'База данных успешно удалена',
    DBDropError = 'Не удалось удалить базу данных',
}