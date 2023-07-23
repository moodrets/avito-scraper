import { IFilterFields, IProfileItem, IReviewsItem } from "@/types/interfaces";

enum MessagesEnum {
    InfoNotFound = 'Информация не найдена',
    ProfileInfoSuccess = 'Получена информация профиля',
    FilterFieldsNotReceived = 'Страница не получила поля фильтра',
    ParsingReviewsStarted = 'Парсинг отзывов запущен',
    ParsingReviewsEnded = 'Парсинг отзывов завершен',
    ReviewsNotFound = 'Отзывы не найдены',
    ReviewsSelectorsNotFound = 'Не найдены селекторы в отзывах',
    ReviewsModalScrollerNotFound = 'Не найден селектор для скрола в модалке',
}

let FILTER_FIELDS: IFilterFields | null = null

const SELECTORS = {
    profileName: '.Sidebar-root-h24MJ .desktop-1r4tu1s',
    profileReviewsCount: '.Sidebar-root-h24MJ .desktop-fgq05w',
    profileRating: '.Sidebar-root-h24MJ [data-marker="profile/score"]',
    profileSubscribers: '.Sidebar-root-h24MJ [data-marker="favorite-seller-counters"]',
    profileAsideInfoItems: '.Sidebar-root-h24MJ .ProfileBadge-root-bcR8G',

    reviewsItem: '.style-snippet-E6g8Y',
    reviewsItemProductName: '.desktop-35wlrd',
    reviewsItemDateDelivery: '.desktop-11ffzh3',
    reviewsItemRatingStars: '.RatingStars-root-Edhhx .Attributes-yellow-star-PY9XT',
    reviewsMoreLoadButton: '[data-marker="rating-list/moreReviewsButton"]',
    reviewsSummaryButton: '[data-marker="profile/summary"]',
    reviewsModal: '[data-marker="profile-rating-detailed/popup"]',
    reviewsModalScroller: '.desktop-y382as',
    reviewsModalScrollerInner: '.style-root-qXsDs',

    // TODO: иногда выскакивает такая кнопка (нужно проверять ее наличие)
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

function scrollElement(element: HTMLElement | Element, top: number){
    element.scrollTo({
        top: top,
        behavior: 'smooth'
    })
}

async function getProfileInfo(data: Record<string, any>): Promise<void> {
    let profileNameEl = document.querySelector(SELECTORS.profileName)
    let profileReviewsEl = document.querySelector(SELECTORS.profileReviewsCount)
    let profileRatingEl = document.querySelector(SELECTORS.profileRating)
    let profileSubscribersEl = document.querySelector(SELECTORS.profileSubscribers)
    let profileDeviveryInfoEl = [...document.querySelectorAll(SELECTORS.profileAsideInfoItems)]?.find(item => item.textContent?.includes('продаж'))

    let profileSubscribersInfo = profileSubscribersEl?.textContent ? profileSubscribersEl.textContent.split(',')[0] : null

    let profileInform: IProfileItem = {
        parsingDate: Date.now(),
        name: profileNameEl?.textContent || MessagesEnum.InfoNotFound,
        rating: profileRatingEl?.textContent || MessagesEnum.InfoNotFound,
        reviewsCount: profileReviewsEl?.textContent || MessagesEnum.InfoNotFound,
        subscribers: profileSubscribersInfo || MessagesEnum.InfoNotFound,
        deliveryInfo: profileDeviveryInfoEl?.textContent || MessagesEnum.InfoNotFound,
        url: data.profileLink
    }

    await sendMessage({
        toastType: 'success', 
        toastText: MessagesEnum.ProfileInfoSuccess,
        profileInform,
    })
}

const ReviewsParser = {
    parsingEnded: false,
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
    makeDateFromReviewString(dateString: string): number {
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
    async parseItems() {
        let reviewsDataList: IReviewsItem[] = []
        let reviewsItemsEls = [...document.querySelectorAll(SELECTORS.reviewsItem)]

        if (!reviewsItemsEls.length) {
            await sendMessage({
                action: 'reviews-parsing-ended',
                toastType: 'error',
                toastText: MessagesEnum.ReviewsNotFound,
            });
            return
        }

        for (const item of reviewsItemsEls) {
            let ratingStarsEls = item.querySelectorAll(SELECTORS.reviewsItemRatingStars)
            let productNameEl = item.querySelector(SELECTORS.reviewsItemProductName)
            let dateDeliveryEl = item.querySelector(SELECTORS.reviewsItemDateDelivery)

            let deliveryText = null
            let dateText = null
            let date = null

            if (dateDeliveryEl?.textContent) {
                dateText = dateDeliveryEl?.textContent.split(',')[0] || null
                deliveryText = dateDeliveryEl?.textContent.split(',')[1] || null
            }

            if (dateText) {
                date = this.makeDateFromReviewString(dateText)
            }

            if (!dateText || !date) {
                await sendMessage({
                    action: 'reviews-parsing-ended',
                    toastType: 'error',
                    toastText: MessagesEnum.ReviewsSelectorsNotFound,
                });
                break 
            }

            let parsedReviewItem: IReviewsItem = {
                date: date || 0,
                dateText: dateText || MessagesEnum.InfoNotFound,
                delivery: deliveryText ? true : false,
                productName: productNameEl?.textContent || MessagesEnum.InfoNotFound,
                rating: ratingStarsEls?.length || 0,
            }

            reviewsDataList.push(parsedReviewItem)

            if (FILTER_FIELDS?.dateFrom && parsedReviewItem.date <= this.makeDateFromFilterString(FILTER_FIELDS?.dateFrom)) {
                this.parsingEnded = true
                break
            }
        }

        if (this.parsingEnded) {

            const reviewsFilteredList = this.getFilteredList(reviewsDataList)
        
            await sendMessage({
                action: 'reviews-parsing-ended',
                toastType: 'success',
                toastText: MessagesEnum.ParsingReviewsEnded,
                reviewsFilteredList,
            });

            window.close()

        } else {
            
            reviewsDataList = []

            if (this.modal) {
                this.loadMoreInModal()
            } else {
                this.loadMoreOnPage()
            }
        }
    },
    async loadMoreInModal() {
        const reviewsModalScrollerEl = this.modal?.querySelector(SELECTORS.reviewsModalScroller)
        const reviewsModalScrollerInnerEl = this.modal?.querySelector(SELECTORS.reviewsModalScrollerInner)

        if (!reviewsModalScrollerEl || !reviewsModalScrollerInnerEl) {
            await sendMessage({
                action: 'reviews-parsing-ended',
                toastType: 'error',
                toastText: MessagesEnum.ReviewsModalScrollerNotFound,
            });
        }

        if (reviewsModalScrollerEl && reviewsModalScrollerInnerEl) {
            scrollElement(reviewsModalScrollerEl, reviewsModalScrollerInnerEl.clientHeight)
            await wait(2000)
            this.parseItems()
        }
    },
    async loadMoreOnPage() {
        scrollPageToBottom()
        await wait(2000)
        if (this.loadMoreButton) {
            this.loadMoreButton.click()
        }
        await wait(3000)
        this.parseItems()
    },
    async parsingStart() {
        await sendMessage({
            action: 'reviews-parsing-started',
            toastType: 'success', 
            toastText: MessagesEnum.ParsingReviewsStarted,
        });

        await wait(1000)
        this.summaryButton?.click()
        await wait(3000)
        this.parseItems()
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
        FILTER_FIELDS && getProfileInfo(FILTER_FIELDS)
        ReviewsParser.parsingStart()
    }
})