import { IReviewsFilterFields } from "@/reactive/useReviewsFilter";
import { IProfileItem, IReviewsItem } from "@/reactive/useProfileInfoList";

enum MessagesEnum {
    InfoNotFound = 'Информация не найдена',
    ProfileInfoSuccess = 'Получена информация профиля',
    FilterFieldsNotReceived = 'Страница не получила поля фильтра',
    ParsingReviewsStarted = 'Парсинг отзывов запущен',
    ParsingReviewsEnded = 'Парсинг отзывов завершен',
    ProfileWithoutDelivery = 'Нет продаж с Авито Доставкой',
    ReviewsNotFound = 'Отзывы не найдены',
    ReviewsSelectorsNotFound = 'Не найдены селекторы в отзывах',
    ReviewsModalScrollerNotFound = 'Не найден селектор для скрола в модалке',
}

let REVIEWS_FILTER_FIELDS: IReviewsFilterFields | null = null
let CURRENT_URL: string = ''

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
    reviewsMoreLoadButtonError: '[data-marker="errorMessage/button"]',
    reviewsSummaryButton: '[data-marker="profile/summary"]',
    reviewsModal: '[data-marker="profile-rating-detailed/popup"]',
    reviewsModalScroller: '.desktop-y382as',
    reviewsModalScrollerInner: '.style-root-qXsDs',
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

function generateColor(): string {
    const color = Math.floor(Math.random()*16777215).toString(16);
    return `#${color}`
}

function generateLightColor() {
    let color = "#";
    for (let i = 0; i < 3; i++)
        color += ("0" + Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)).slice(-2);
    return color;
}

async function getProfileInfo(): Promise<void> {
    let profileNameEl = document.querySelector(SELECTORS.profileName)
    let profileReviewsEl = document.querySelector(SELECTORS.profileReviewsCount)
    let profileRatingEl = document.querySelector(SELECTORS.profileRating)
    let profileSubscribersEl = document.querySelector(SELECTORS.profileSubscribers)
    let profileDeviveryInfoEl = [...document.querySelectorAll(SELECTORS.profileAsideInfoItems)]?.find(item => item.textContent?.includes('прода'))

    let profileSubscribersInfo = profileSubscribersEl?.textContent ? profileSubscribersEl.textContent.split(',')[0] : null

    let profileInform: IProfileItem = {
        parsingDate: Date.now(),
        name: profileNameEl?.textContent || MessagesEnum.InfoNotFound,
        rating: profileRatingEl?.textContent || MessagesEnum.InfoNotFound,
        reviewsCount: profileReviewsEl?.textContent || MessagesEnum.InfoNotFound,
        subscribers: profileSubscribersInfo || MessagesEnum.InfoNotFound,
        deliveryInfo: profileDeviveryInfoEl?.textContent || MessagesEnum.ProfileWithoutDelivery,
        reviewsSortedBy: 'productName',
        url: CURRENT_URL,
        opened: false,
        loading: false,
        comment: '',
        color: generateLightColor()
    }

    await sendMessage({
        action: 'profile-info',
        status: 'success',
        currentUrl: CURRENT_URL,
        messsage: MessagesEnum.ProfileInfoSuccess,
        data: profileInform,
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
    get loadMoreButtonError(){
        return document.querySelector(SELECTORS.reviewsMoreLoadButtonError) as HTMLButtonElement
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
        if (REVIEWS_FILTER_FIELDS?.dateFrom && REVIEWS_FILTER_FIELDS?.dateTo) {
            resultList = resultList.filter((item) => {
                if (
                    REVIEWS_FILTER_FIELDS?.dateFrom && 
                    REVIEWS_FILTER_FIELDS?.dateTo &&
                    item.date >= this.makeDateFromFilterString(REVIEWS_FILTER_FIELDS.dateFrom) &&
                    item.date <= this.makeDateFromFilterString(REVIEWS_FILTER_FIELDS.dateTo)
                ) {
                    return item
                }
            })
        }

        // фильтруем по рейтингу
        if (REVIEWS_FILTER_FIELDS?.ratingFrom && REVIEWS_FILTER_FIELDS?.ratingTo) {
            resultList = resultList.filter((item) => {
                if (
                    REVIEWS_FILTER_FIELDS?.ratingFrom &&
                    REVIEWS_FILTER_FIELDS?.ratingTo &&
                    item.rating >= REVIEWS_FILTER_FIELDS?.ratingFrom &&
                    item.rating <= REVIEWS_FILTER_FIELDS?.ratingTo
                ) {
                    return item
                }
            })
        }

        // фильтруем по названию
        if (REVIEWS_FILTER_FIELDS?.productName) {
            resultList = resultList.filter((item) => {

                let lowercaseProductName = item.productName.toLowerCase()
                let lowercaseFilterProductName = (REVIEWS_FILTER_FIELDS as IReviewsFilterFields).productName.toLowerCase()

                if (lowercaseProductName.includes(lowercaseFilterProductName)) {
                    return item
                }
            })
        }

        // ищем только с доставкой
        if (REVIEWS_FILTER_FIELDS?.deliveryOnly) {
            resultList = resultList.filter((item) => item.delivery)
        }

        return resultList
    },
    makeReviewItemData(reviewElement: Element): IReviewsItem {
        let ratingStarsEls = reviewElement.querySelectorAll(SELECTORS.reviewsItemRatingStars)
        let productNameEl = reviewElement.querySelector(SELECTORS.reviewsItemProductName)
        let dateDeliveryEl = reviewElement.querySelector(SELECTORS.reviewsItemDateDelivery)

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

        let parsedReviewItem: IReviewsItem = {
            date: date || 0,
            dateText: dateText || MessagesEnum.InfoNotFound,
            delivery: deliveryText ? true : false,
            productName: productNameEl?.textContent || MessagesEnum.InfoNotFound,
            rating: ratingStarsEls?.length || 0,
            profileUrl: CURRENT_URL
        }

        return parsedReviewItem
    },
    async parseItems() {
        if (this.loadMoreButtonError) {
            this.loadMoreButtonError.click()
            await wait(3000)
        }

        let reviewsDataList: IReviewsItem[] = []
        let reviewsItemsEls = [...document.querySelectorAll(SELECTORS.reviewsItem)]
        
        try {
            let lastReviewEl = reviewsItemsEls[reviewsItemsEls.length - 1]
            let lastReviewData = this.makeReviewItemData(lastReviewEl)

            if (!reviewsItemsEls.length || !lastReviewEl) {
                throw new Error()
            }
            
            if (lastReviewData.date === 0) {
                throw new Error()
            }
    
            if (REVIEWS_FILTER_FIELDS?.dateFrom && lastReviewData.date < this.makeDateFromFilterString(REVIEWS_FILTER_FIELDS?.dateFrom)) {
                this.parsingEnded = true
            }

        } catch(error: any) {

            await sendMessage({
                action: 'reviews-parsing-ended',
                status: 'error',
                currentUrl: CURRENT_URL,
                message: MessagesEnum.ReviewsSelectorsNotFound,
            })

            return
        }

        if (this.parsingEnded) {

            for (let item of reviewsItemsEls) {
                let reviewItemData = this.makeReviewItemData(item)
                reviewsDataList.push(reviewItemData)
            }

            let reviewsFilteredList = this.getFilteredList(reviewsDataList)
        
            await sendMessage({
                action: 'reviews-parsing-ended',
                status: 'success',
                currentUrl: CURRENT_URL,
                message: MessagesEnum.ParsingReviewsEnded,
                data: reviewsFilteredList,
            });

        } else {
            if (this.modal) {
                this.loadMoreInModal()
            } else {
                this.loadMoreOnPage()
            }
        }
    },
    async loadMoreInModal() {
        if (this.loadMoreButtonError) {
            this.loadMoreButtonError.click()
            await wait(3000)
            this.loadMoreInModal()
            return
        }
        
        const reviewsModalScrollerEl = this.modal?.querySelector(SELECTORS.reviewsModalScroller)
        const reviewsModalScrollerInnerEl = this.modal?.querySelector(SELECTORS.reviewsModalScrollerInner)

        if (!reviewsModalScrollerEl || !reviewsModalScrollerInnerEl) {
            await sendMessage({
                action: 'reviews-parsing-ended',
                status: 'error',
                currentUrl: CURRENT_URL,
                message: MessagesEnum.ReviewsModalScrollerNotFound,
            });
            return
        }

        

        if (reviewsModalScrollerEl && reviewsModalScrollerInnerEl) {
            scrollElement(reviewsModalScrollerEl, reviewsModalScrollerInnerEl.clientHeight)
            await wait(2000)
            this.parseItems()
        }
    },
    async loadMoreOnPage() {
        if (this.loadMoreButtonError) {
            this.loadMoreButtonError.click()
            await wait(3000)
            this.loadMoreOnPage()
            return
        }

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
            status: 'success',
            currentUrl: CURRENT_URL,
            message: MessagesEnum.ParsingReviewsStarted,
        });

        await wait(1000)
        this.summaryButton?.click()
        await wait(3000)
        this.parseItems()
    }
}

chrome.runtime.onMessage.addListener(async ({action, reviewsFilterFields, currentUrl}) => {
    if (!reviewsFilterFields) {
        await sendMessage({
            action: 'reviews-parsing-ended',
            status: 'error',
            currentUrl: CURRENT_URL,
            message: MessagesEnum.FilterFieldsNotReceived,
        });
        return
    }

    if (action === 'reviews-parsing-start' && reviewsFilterFields) {
        await wait(1000)
        CURRENT_URL = currentUrl
        REVIEWS_FILTER_FIELDS = reviewsFilterFields
        REVIEWS_FILTER_FIELDS && getProfileInfo()
        ReviewsParser.parsingStart()
    }
})