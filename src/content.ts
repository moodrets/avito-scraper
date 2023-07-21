import { IFilterFields, IProfileItem, IReviewsItem } from "@/types/infterfaces";

enum MessagesEnum {
    InfoNotFound = 'Информация не найдена',
    ProfileInfoSuccess = 'Получена информация профиля',
    FilterFieldsNotReceived = 'Страница не получила поля фильтра',
    ParsingReviewsStarted = 'Парсинг отзывов запущен',
    ParsingReviewsEnded = 'Парсинг отзывов завершен',
    ReviewsNotFound = 'Отзывы не найдены'
}

let FILTER_FIELDS: IFilterFields | null = null

const SELECTORS = {
    profileName: '.desktop-1r4tu1s',
    profileReviewsCount: '.desktop-fgq05w',
    profileRating: '[data-marker="profile/score"]',
    profileSubscribers: '[data-marker="favorite-seller-counters"]',
    profileDeviveryInfo: '.Sidebar-root-h24MJ .ProfileBadge-root-bcR8G:nth-child(2)',

    reviewsItem: '.style-snippet-E6g8Y',
    reviewsItemProductName: '.desktop-35wlrd',
    reviewsItemDateDelivery: '.desktop-11ffzh3',
    reviewsItemRatingStars: '.RatingStars-root-Edhhx .Attributes-yellow-star-PY9XT',
    reviewsMoreLoadButton: '[data-marker="rating-list/moreReviewsButton"]',
}

async function sendMessage(data: Record<string, any>){
    await chrome.runtime.sendMessage(data);
}

async function delay(timeout: number) {
    return new Promise(resolve => {
        setTimeout(()=>{
            resolve(true)
        }, timeout)
    })
}

function scrollPageToBottom() {
    window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" });
}

async function getProfileInfo(data: Record<string, any>): Promise<void> {
    const profileNameEl = document.querySelector(SELECTORS.profileName)
    const profileReviewsEl = document.querySelector(SELECTORS.profileReviewsCount)
    const profileRatingEl = document.querySelector(SELECTORS.profileRating)
    const profileSubscribersEl = document.querySelector(SELECTORS.profileSubscribers)
    const profileDeviveryInfoEl = document.querySelector(SELECTORS.profileDeviveryInfo)

    const profileInform: IProfileItem = {
        createdDate: Date.now(),
        createdDateFormatted: new Date().toLocaleString('ru-RU'),
        name: profileNameEl?.textContent || MessagesEnum.InfoNotFound,
        rating: profileRatingEl?.textContent || MessagesEnum.InfoNotFound,
        reviewsCount: profileReviewsEl?.textContent || MessagesEnum.InfoNotFound,
        subscribers: profileSubscribersEl?.textContent || MessagesEnum.InfoNotFound,
        deliveryInfo: profileDeviveryInfoEl?.textContent || MessagesEnum.InfoNotFound,
        existsInDataBase: false,
        url: data.profileLink
    }

    await sendMessage({
        toastType: 'success', 
        toastText: MessagesEnum.ProfileInfoSuccess,
        profileInform,
    })
}

const ReviewsParser = {
    loadMoreButton(){
        return document.querySelector(SELECTORS.reviewsMoreLoadButton) as HTMLButtonElement
    },
    async parseItems(){
        const parsedReviewsList: IReviewsItem[] = []
        const reviewsItemsEls = document.querySelectorAll(SELECTORS.reviewsItem)

        if (!reviewsItemsEls.length) {
            await sendMessage({
                action: 'parsing-ended',
                toastType: 'error', 
                toastText: MessagesEnum.ReviewsNotFound,
            });
            return
        }

        console.log(FILTER_FIELDS);

        reviewsItemsEls.forEach((item: Element) => {
            // const ratingStarsEls = item.querySelector(SELECTORS.reviewsItemRatingStars)
            // const productNameEl = item.querySelector(SELECTORS.reviewsItemProductName)
            // const dateDeliveryEl = item.querySelector(SELECTORS.reviewsItemDateDelivery)
        })
        
        await sendMessage({
            action: 'parsing-ended',
            toastType: 'success',
            toastText: MessagesEnum.ParsingReviewsEnded,
            parsedReviewsList,
        });

        // window.close();
    },
    async loadMoreOnPage() {
        scrollPageToBottom()
        await delay(2000)
        const reviewsLoadMoreEl: HTMLButtonElement | null = this.loadMoreButton()

        if (reviewsLoadMoreEl) {
            reviewsLoadMoreEl?.click()
            this.loadMoreOnPage()
        }

        if (!reviewsLoadMoreEl) {
            await delay(2000)
            if (this.loadMoreButton()) {
                this.loadMoreOnPage()
                return
            }

            scrollPageToBottom()
            this.parseItems()
        }
    },
    async parsingStart() {
        await sendMessage({
            action: 'parsing-started',
            toastType: 'success', 
            toastText: MessagesEnum.ParsingReviewsStarted,
        });
        scrollPageToBottom()
        await delay(2000)
        scrollPageToBottom()
        this.loadMoreOnPage()
    }
}

chrome.runtime.onMessage.addListener(async ({action, filterFields}) => {
    if (!filterFields) {
        await sendMessage({
            toastType: 'success', 
            toastText: MessagesEnum.FilterFieldsNotReceived,
        });
        return
    }

    if (action === 'parsing-start' && filterFields) {
        FILTER_FIELDS = filterFields
        getProfileInfo(filterFields)
        ReviewsParser.parsingStart()
    }
})