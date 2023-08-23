export enum MessagesEnum {
    // filter
    ReviewsFilterSaved = 'Фильтр парсинга сохранен',
    ReviewsFilterSaveError = 'Не удалось сохранить фильтр парсинга',
    ReviewsFilterCleared = 'Фильтр парсинга сброшен',
    ReviewsFilterClearError = 'Не удалось удалить фильтр парсинга из базы',
    ReviewsFilterGetError = 'Не удалось достать фильтр парсинга из базы',
    ReviewsFilterAllLinksParsed = 'Все ссылки уже прошли парсинг',
    ReviewsFilterSimilarLinks = 'В фильтре парсинга присутствуют одинаковые ссылки',
    // profiles search filter
    ProfilesSearchFilterSaved = 'Фильтр поиска сохранен',
    ProfilesSearchFilterSaveError = 'Не удалось сохранить фильтр поиска',
    ProfilesSearchFilterCleared = 'Фильтр поиска сброшен',
    ProfilesSearchFilterClearError = 'Не удалось удалить фильтр поиска из базы',
    ProfilesSearchFilterGetError = 'Не удалось достать фильтр поиска из базы',
    ProfilesSearchedListCreated = 'Список найденных продавцов сохранен',
    ProfilesSearchedListCreateError = 'Не удалось сохранить список найденных продавцов',
    ProfilesSearchedListCleared = 'Список найденных продавцов очищен',
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
    ProfileLinkCopied = 'Ссылка профиля скопирована в буффер',
    ProfileLinkAddedInReviewsFilter = 'Ссылка профиля вставлена в форму фильтра',
    ProfileInfoListAddedInDB = 'Список профилей сохранен',
    ProfileInfoListRemovedFromDB = 'Список профилей очищен',
    // common
    InfoCopied = 'Информация скопирована в буффер',
    InfoNotFound = 'Информация не найдена',
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

    ProfilesParsingEnded = 'Поиск продавцов завершен',
    ProfilesParsingError = 'Поиск продавцов завершен неудачно',
}