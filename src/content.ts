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
    reviewsSummaryButton: '[data-marker="profile/summary"]',
    reviewsModal: '[data-marker="profile-rating-detailed/popup"]',

    // TODO: иногда выскакивает такая кнопка (нужно проверять наличие кнопки)
    reviewsMoreLoadErrorButton: '[data-marker="errorMessage/button"]'
}

async function sendMessage(data: Record<string, any>){
    await chrome.runtime.sendMessage(data);
}

async function wait(timeout: number) {
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
    makeDateFromFilterString(dateString: string): number {
        let splitString = dateString.split('.')
        let day = splitString[0];
        let month = splitString[1];
        let year = splitString[2];

        return Date.parse(`${year} ${month} ${day}`)
    },
    get loadMoreButton() {
        return document.querySelector(SELECTORS.reviewsMoreLoadButton) as HTMLButtonElement
    },
    get summaryButton() {
        return document.querySelector(SELECTORS.reviewsSummaryButton) as HTMLButtonElement
    },
    get modal() {
        return document.querySelector(SELECTORS.reviewsModal) as HTMLElement
    },
    getFilteredList(reviewsDataList: IReviewsItem[]) {
        let resultList = [...reviewsDataList]

        // фильтруем по дате
        if (FILTER_FIELDS?.dateFrom && FILTER_FIELDS?.dateTo) {
            resultList = resultList.filter((item) => {
                if (
                    FILTER_FIELDS?.dateFrom && 
                    FILTER_FIELDS?.dateTo &&
                    item.date >= this.makeDateFromFilterString(FILTER_FIELDS.dateFrom) &&
                    item.date <= this.makeDateFromFilterString(FILTER_FIELDS.dateTo)
                ) {
                    return item
                }
            })
        }

        // фильтруем по рейтингу
        if (FILTER_FIELDS?.ratingFrom && FILTER_FIELDS?.ratingTo) {
            resultList = resultList.filter((item) => {
                if (
                    FILTER_FIELDS?.ratingFrom &&
                    FILTER_FIELDS?.ratingTo &&
                    item.rating >= FILTER_FIELDS?.ratingFrom &&
                    item.rating <= FILTER_FIELDS?.ratingTo
                ) {
                    return item
                }
            })
        }

        // фильтруем по названию
        if (FILTER_FIELDS?.productName) {
            resultList = resultList.filter((item) => {

                let lowercaseProductName = item.productName.toLowerCase()
                let lowercaseFilterProductName = (FILTER_FIELDS as IFilterFields).productName.toLowerCase()

                if (lowercaseProductName.includes(lowercaseFilterProductName)) {
                    return item
                }
            })
        }

        // ищем только с доставкой
        if (FILTER_FIELDS?.deliveryOnly) {
            resultList = resultList.filter((item) => item.delivery)
        }

        return resultList
    },
    async parseItems(){
        const reviewsDataList: IReviewsItem[] = []
        const reviewsItemsEls = document.querySelectorAll(SELECTORS.reviewsItem)

        if (!reviewsItemsEls.length) {
            await sendMessage({
                action: 'reviews-parsing-ended',
                toastType: 'error', 
                toastText: MessagesEnum.ReviewsNotFound,
            });
            return
        }

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

            reviewsDataList.push({
                date: date || 0,
                dateText: dateText || MessagesEnum.InfoNotFound,
                delivery: deliveryText ? true : false,
                productName: productNameEl?.textContent || MessagesEnum.InfoNotFound,
                rating: ratingStarsEls?.length || 0,
            })
        })

        const reviewsFilteredList = this.getFilteredList(reviewsDataList)
        
        await sendMessage({
            action: 'reviews-parsing-ended',
            toastType: 'success',
            toastText: MessagesEnum.ParsingReviewsEnded,
            reviewsFilteredList,
        });

        // window.close();
    },
    async loadMoreInModal() {

    },
    async loadMoreOnPage() {
        scrollPageToBottom()
        await wait(2000)

        if (this.loadMoreButton) {
            this.loadMoreButton.click()
            this.loadMoreOnPage()
        }

        if (!this.loadMoreButton) {
            await wait(2000)

            if (this.loadMoreButton) {
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

        this.summaryButton?.click()
        await wait(3500)

        // если отзывы в модальном окне
        if (this.modal) {
            this.loadMoreInModal()
            return   
        }

        // если отзывы на странице
        scrollPageToBottom()
        await wait(2000)
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