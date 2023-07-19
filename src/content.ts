const enum ToastMessagesEnum {
    ParsingStarted = 'Парсинг отзывов начался',
    ProfileInfoSuccess = 'Получена информация профиля'
}

const enum InfoTextEnum {
    InfoNotFound = 'Инфомация не найдена'
}

const SELECTORS = {
    profileName: '.desktop-1r4tu1s',
    profileReviewsCount: '.desktop-fgq05w',
    profileRating: '[data-marker="profile/score"]',
    profileSubscribers: '[data-marker="favorite-seller-counters"]',
    profileDeviveryInfo: '.ProfileBadge-title-_Z4By'
}

async function getProfileInfo(data: Record<string, any>): Promise<void> {
    console.log(data);
    
    const profileNameEl = document.querySelector(SELECTORS.profileName)
    const profileReviewsEl = document.querySelector(SELECTORS.profileReviewsCount)
    const profileRatingEl = document.querySelector(SELECTORS.profileRating)
    const profileSubscribersEl = document.querySelector(SELECTORS.profileSubscribers)
    const profileDeviveryInfoEl = document.querySelector(SELECTORS.profileDeviveryInfo)
    
    const profileInfo = {
        date: Date.now(),
        formattedDate: new Date().toLocaleString('ru-RU'),
        name: profileNameEl?.textContent || InfoTextEnum.InfoNotFound,
        rating: profileRatingEl?.textContent || InfoTextEnum.InfoNotFound,
        reviewsCount: profileReviewsEl?.textContent || InfoTextEnum.InfoNotFound,
        subscribers: profileSubscribersEl?.textContent || InfoTextEnum.InfoNotFound,
        deliveryInfo: profileDeviveryInfoEl?.textContent || InfoTextEnum.InfoNotFound,
        existsInDataBase: false,
        url: data.profileLink
    }

    await chrome.runtime.sendMessage({
        toastType: 'success', 
        toastText: ToastMessagesEnum.ProfileInfoSuccess,
        profileInfo,
    });
}

chrome.runtime.onMessage.addListener(({action, filterFields}) => {
    if (action === 'parsing-start') {
        getProfileInfo(filterFields)
    }
})