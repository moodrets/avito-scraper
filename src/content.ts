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
    getDateOrDeliveryText(textContent: string, target: 'date' | 'delivery'): string | null {
        let splitStr = textContent.split(',')

        if (splitStr[0] && target === 'date') {
            return splitStr[0]
        }

        if (splitStr[1] && target === 'delivery') {
            return splitStr[1]
        }

        return null
    },
    makeMonthNumberFromText(monthText: string): string {
        let monthNumber = ''

        switch (monthText) {
            case 'января':
                monthNumber = '01'
                break
            case 'февраля':
                monthNumber = '02'
                break
            case 'марта':
                monthNumber = '03'
                break
            case 'апреля':
                monthNumber = '04'
                break
            case 'мая':
                monthNumber = '05'
                break
            case 'июня':
                monthNumber = '06'
                break
            case 'июля':
                monthNumber = '07'
                break
            case 'августа':
                monthNumber = '08'
                break
            case 'сентября':
                monthNumber = '09'
                break
            case 'октября':
                monthNumber = '10'
                break
            case 'ноября':
                monthNumber = '11'
                break
            case 'декабря':
                monthNumber = '12'
                break
        }

        return monthNumber
    },
    makeDateFromString(dateString: string): number {
        if (dateString.trim() === 'сегодня') {
            return Date.now()
        }

        if (dateString.trim() === 'вчера') {
            return new Date().setDate(new Date().getDate() - 1)
        }

        let splitDateString = dateString.split(' ')
        let day = splitDateString[0]
        let month = this.makeMonthNumberFromText(splitDateString[1])
        let year = splitDateString[2] || `${new Date().getFullYear()}`

        return Date.parse(`${year} ${month} ${day}`)
    },
    loadMoreButton(){
        return document.querySelector(SELECTORS.reviewsMoreLoadButton) as HTMLButtonElement
    },
    async parseItems(){
        const parsedReviewsList: IReviewsItem[] = []
        const reviewsItemsEls = document.querySelectorAll(SELECTORS.reviewsItem)

        if (!reviewsItemsEls.length) {
            await sendMessage({
                action: 'reviews-parsing-ended',
                toastType: 'error', 
                toastText: MessagesEnum.ReviewsNotFound,
            });
            return
        }

        console.log(FILTER_FIELDS);

        reviewsItemsEls.forEach((item: Element) => {
            const ratingStarsEls = item.querySelectorAll(SELECTORS.reviewsItemRatingStars)
            const productNameEl = item.querySelector(SELECTORS.reviewsItemProductName)
            const dateDeliveryEl = item.querySelector(SELECTORS.reviewsItemDateDelivery)
            
            let deliveryText = null
            let dateText = null
            let date = null

            if (dateDeliveryEl?.textContent) {
                dateText = this.getDateOrDeliveryText(dateDeliveryEl.textContent, 'date')
            }

            if (dateDeliveryEl?.textContent) {
                deliveryText = this.getDateOrDeliveryText(dateDeliveryEl.textContent, 'delivery')
            }

            if (dateText) {
                date = this.makeDateFromString(dateText)
            }

            parsedReviewsList.push({
                date: date || MessagesEnum.InfoNotFound,
                dateText: dateText || MessagesEnum.InfoNotFound,
                delivery: deliveryText ? true : false,
                productName: productNameEl?.textContent || MessagesEnum.InfoNotFound,
                rating: ratingStarsEls?.length || MessagesEnum.InfoNotFound,
            })
        })
        
        await sendMessage({
            action: 'reviews-parsing-ended',
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
            action: 'reviews-parsing-started',
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

    if (action === 'reviews-parsing-start' && filterFields) {
        FILTER_FIELDS = filterFields
        getProfileInfo(filterFields)
        ReviewsParser.parsingStart()
    }
})