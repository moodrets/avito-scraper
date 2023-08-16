import { IReviewsFilterFields } from "@/reactive/useReviewsFilter"
import { IProfileItem, IReviewsItem } from "@/reactive/useProfileInfoList"
import { IProfileFilterFields, IProfileInAdd } from "./reactive/useProfilesFilter";

enum MessagesEnum {
    InfoNotFound = 'Информация не найдена',
    ProfileInfoSuccess = 'Получена информация профиля',
    FilterFieldsNotReceived = 'Страница не получила поля фильтра',
    ParsingReviewsStarted = 'Парсинг отзывов запущен',
    ParsingReviewsEnded = 'Парсинг отзывов завершен',
    ProfileWithoutDelivery = 'Нет продаж с Авито Доставкой',
    ReviewsNotFound = 'Отзывы не найдены',
    ReviewsRequestError = 'Ошибка запроса отзывов',
    ReviewsSelectorsNotFound = 'Не найдены селекторы в отзывах',
    ReviewsModalScrollerNotFound = 'Не найден селектор для скрола в модалке',
}

async function sendMessage(data: Record<string, any>) {
    await chrome.runtime.sendMessage(data);
}

async function wait(timeout: number) {
    return new Promise(resolve => {
        setTimeout(() => {
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

function generateLightColor() {
    let color = "#";
    for (let i = 0; i < 3; i++) {
        color += ("0" + Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)).slice(-2)
    }
    return color;
}

function generateContrastColors() {
    let r = Math.floor((Math.random() * 256) - 1)
    let g = Math.floor((Math.random() * 256) - 1)
    let b = Math.floor((Math.random() * 256) - 1)

    let brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000
    let lightText = ((255 * 299) + (255 * 587) + (255 * 114)) / 1000
    let darkText = ((0 * 299) + (0 * 587) + (0 * 114)) / 1000

    let text = Math.abs(brightness - lightText) > Math.abs(brightness - darkText) ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"

    return {
        text,
        bg: `rgb(${r},${g},${b})`
    }
}

function randomNumberBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getProfileInfo(currentURL: string): Promise<void> {
    const SELECTORS = {
        profileName: '.Sidebar-root-h24MJ [data-marker*="name"]',
        profileReviewsCount: '.Sidebar-root-h24MJ .desktop-fgq05w',
        profileRating: '.Sidebar-root-h24MJ [data-marker="profile/score"]',
        profileSubscribers: '.Sidebar-root-h24MJ [data-marker="favorite-seller-counters"]',
        profileAsideInfoItems: '.Sidebar-root-h24MJ .ProfileBadge-root-bcR8G',
        profileActiveAdds: '[data-marker="profile-tab(active)"]',
        profileActiveAddsNew: '.ExtendedProfile-content-JTybB .desktop-11ncndy .desktop-1r4tu1s',
        profileCompletedAdds: '[data-marker="profile-tab(closed)"]',
    }

    let profileNameEl = document.querySelector(SELECTORS.profileName)
    let profileReviewsEl = document.querySelector(SELECTORS.profileReviewsCount)
    let profileRatingEl = document.querySelector(SELECTORS.profileRating)
    let profileSubscribersEl = document.querySelector(SELECTORS.profileSubscribers)
    let profileDeviveryInfoEl = [...document.querySelectorAll(SELECTORS.profileAsideInfoItems)]?.find(item => item.textContent?.includes('продаж'))
    let profileActiveAddsEl = document.querySelector(SELECTORS.profileActiveAdds)
    let profileActiveAddsNewEl = document.querySelector(SELECTORS.profileActiveAddsNew)
    let profileCompletedAddsEl = document.querySelector(SELECTORS.profileCompletedAdds)

    let profileSubscribersText = profileSubscribersEl?.textContent ? profileSubscribersEl.textContent.split(',')[0] : null
    let profileActiveAddsText = profileActiveAddsEl?.textContent ? profileActiveAddsEl.textContent.replace(/\D/g, '') : null
    let profileActiveAddsNewText = profileActiveAddsNewEl?.textContent ? profileActiveAddsNewEl.textContent.replace(/\D/g, '') : null
    let profileCompletedAddsText = profileCompletedAddsEl?.textContent ? profileCompletedAddsEl.textContent.replace(/\D/g, '') : null

    let profileInform: IProfileItem = {
        name: profileNameEl?.textContent || MessagesEnum.InfoNotFound,
        rating: profileRatingEl?.textContent || MessagesEnum.InfoNotFound,
        reviewsCount: profileReviewsEl?.textContent || MessagesEnum.InfoNotFound,
        subscribers: profileSubscribersText || MessagesEnum.InfoNotFound,
        deliveryInfo: profileDeviveryInfoEl?.textContent || MessagesEnum.ProfileWithoutDelivery,
        activeAdds: profileActiveAddsText || profileActiveAddsNewText || MessagesEnum.InfoNotFound,
        completedAdds: profileCompletedAddsText || '',
        parsingDate: Date.now(),
        reviewsSortedBy: 'product_name_asc',
        url: currentURL,
        opened: false,
        loading: false,
        marked: false,
        comment: '',
        color: generateContrastColors()
    }

    await sendMessage({
        action: 'profile-info',
        status: 'success',
        currentUrl: currentURL,
        messsage: MessagesEnum.ProfileInfoSuccess,
        data: profileInform,
    })
}

interface IReviewsItemAPI {
    type: 'rating',
    value: {
        avatar: string,
        deliveryTitle?: string,
        itemTitle: string,
        rated: string,
        score: number,
        stageTitle: string,
        title: string
    }
}

class ReviewsFactory {
    constructor(filterFields: IReviewsFilterFields, currentURL: string) {
        this.filterFields = filterFields
        this.currentURL = currentURL
    }

    protected currentURL!: string
    
    protected filterFields!: IReviewsFilterFields
    
    protected offset: number = 0

    protected parsingEnded: boolean = false

    protected reviewsCollection: IReviewsItemAPI[] = []

    protected makeDateFromFilterString(dateString: string): number {
        let splitString = dateString.split('.')
        let day = splitString[0];
        let month = splitString[1];
        let year = splitString[2];

        return Date.parse(`${year} ${month} ${day}`)
    }

    protected makeMonthNumberFromText(monthText: string): string {
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
    }
    
    protected makeDateFromReviewString(dateString: string): number {
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
    }

    protected makeReviewItemData(item: IReviewsItemAPI) {
        let parsedReviewItem: IReviewsItem = {
            date: this.makeDateFromReviewString(item.value.rated),
            dateText: item.value.rated,
            delivery: item.value.deliveryTitle ? true : false,
            productName: item.value.itemTitle,
            rating: item.value.score,
            profileUrl: this.currentURL
        }
        return parsedReviewItem
    }

    protected getFilteredList(reviewsDataList: IReviewsItem[]) {
        let resultList = [...reviewsDataList]

        // фильтруем по дате
        if (this.filterFields.dateFrom && this.filterFields.dateTo) {
            resultList = resultList.filter((item) => {
                if (
                    this.filterFields.dateFrom && 
                    this.filterFields.dateTo &&
                    item.date >= this.makeDateFromFilterString(this.filterFields.dateFrom) &&
                    item.date <= this.makeDateFromFilterString(this.filterFields.dateTo)
                ) {
                    return item
                }
            })
        }

        // фильтруем по рейтингу
        if (this.filterFields.ratingFrom && this.filterFields.ratingTo) {
            resultList = resultList.filter((item) => {
                if (
                    this.filterFields.ratingFrom &&
                    this.filterFields.ratingTo &&
                    item.rating >= this.filterFields.ratingFrom &&
                    item.rating <= this.filterFields.ratingTo
                ) {
                    return item
                }
            })
        }

        // фильтруем по названию
        if (this.filterFields.productName) {
            resultList = resultList.filter((item) => {

                let lowercaseProductName = item.productName.toLowerCase()
                let lowercaseFilterProductName = (this.filterFields as IReviewsFilterFields).productName.toLowerCase()

                if (lowercaseProductName.includes(lowercaseFilterProductName)) {
                    return item
                }
            })
        }

        // ищем только с доставкой
        if (this.filterFields.deliveryOnly) {
            resultList = resultList.filter((item) => item.delivery)
        }

        return resultList
    }

    protected async apiGetReviews(requestType: 'first' | 'next'): Promise<IReviewsItemAPI[]> {
        let url = new URL(this.currentURL)
        let urlParams = new URLSearchParams()
        let splitUrl = url.pathname.split('/')
        let userHash = splitUrl[2]
        let requestUrl = `https://www.avito.ru/web/5/user/${userHash}/ratings`

        if (requestType === 'first') {
            urlParams.set('summary_redesign', '1')
        }

        if (requestType === 'next') {
            this.offset += 25
            urlParams.set('limit', '25')
            urlParams.set('offset', `${this.offset}`)
            urlParams.set('sortRating', 'date_desc')
            urlParams.set('summary_redesign', '1')
        }
        
        requestUrl = `${requestUrl}?${urlParams.toString()}`

        let reviewsRequest = await fetch(requestUrl)
        let reviewsRequestJSON = await reviewsRequest.json()
        let resultList = reviewsRequestJSON.entries.filter((item: IReviewsItemAPI) => item.type === 'rating')

        return resultList || []
    }

    public async parseReviews(requestType: 'first' | 'next'): Promise<void> {
        await wait(randomNumberBetween(2, 10) * 1000)

        try {
            let resultList = await this.apiGetReviews(requestType)
            this.reviewsCollection.push(...resultList)
            let lastReviewData = this.makeReviewItemData(this.reviewsCollection[this.reviewsCollection.length - 1])

            if (this.filterFields.dateFrom && lastReviewData.date < this.makeDateFromFilterString(this.filterFields.dateFrom)) {
                this.parsingEnded = true
            }

            if (this.parsingEnded) {
                let reviewsDataList: IReviewsItem[] = []

                for (let item of this.reviewsCollection) {
                    let reviewItemData = this.makeReviewItemData(item)
                    reviewsDataList.push(reviewItemData)
                }

                let reviewsFilteredList = this.getFilteredList(reviewsDataList)
        
                await sendMessage({
                    action: 'reviews-parsing-ended',
                    status: 'success',
                    currentUrl: this.currentURL,
                    data: reviewsFilteredList,
                });

            } else {
                this.parseReviews('next')
            }

        } catch(error: any) {
            await sendMessage({
                action: 'reviews-parsing-ended',
                status: 'error',
                currentUrl: this.currentURL,
                message: MessagesEnum.ReviewsRequestError,
            });

        } finally {

        }
    }

    public async parsingStart() {
        await sendMessage({
            action: 'reviews-parsing-started',
            status: 'success',
            currentUrl: this.currentURL,
        });

        this.parseReviews('first')
    }
}

class ProfilesFactory {
    constructor(filterFields: IProfileFilterFields, currentURL: string){
        this.filterFields = filterFields
        this.currentURL = currentURL
    }

    protected SELECTORS = {
        profileItem: `.iva-item-userInfoStep-dWwGU`,
        profileItemLink: 'a',
        profileItemName: 'a p',
        profileItemRating: '[data-marker="seller-rating/score"]',
        profileItemReviewsCount: '[data-marker="seller-rating/summary"]'
    }

    protected currentURL!: string
    
    protected filterFields!: IProfileFilterFields
    
    protected currentPageNumber: number = 0

    protected profilesCollection: IProfileInAdd[] = []

    protected get pagesRange() {
        let pagesRangeSplit = this.filterFields.pagesRange.split('-')
        return {
            start: pagesRangeSplit[0],
            end: pagesRangeSplit[1]
        }
    }

    protected getFilteredList() {
        let profilesList = [...this.profilesCollection]

        if (this.filterFields.reviewsCount) {
            profilesList = profilesList.filter(item => {
                if (item.reviewsCount >= this.filterFields.reviewsCount) {
                    return item
                }
            })
        }
        
        if (this.filterFields.profileName) {
            profilesList = profilesList.filter(item => {
                let filterProfileNameLowercase = this.filterFields.profileName.toLowerCase()
                let itemProfileNameLowercase = item.name.toLowerCase()

                if (itemProfileNameLowercase.includes(filterProfileNameLowercase)) {
                    return item
                }
            })
        }

        return profilesList
    }

    protected makeProfileItemData(profileElement: HTMLElement): IProfileInAdd {
        let profileLinkEl = profileElement.querySelector(this.SELECTORS.profileItemLink)
        let profileNameEl = profileElement.querySelector(this.SELECTORS.profileItemName)
        let profileRatingEl = profileElement.querySelector(this.SELECTORS.profileItemRating)
        let profileItemReviewsCountEl = profileElement.querySelector(this.SELECTORS.profileItemReviewsCount)

        let profileItemReviewsCountValue = profileItemReviewsCountEl?.textContent?.replace(/\D/g, '')

        let profileItemData: IProfileInAdd = {
            url: (profileLinkEl as HTMLLinkElement).href,
            name: (profileNameEl as HTMLElement).textContent || '',
            rating: (profileRatingEl as HTMLElement).textContent || '',
            reviewsCount: profileItemReviewsCountValue ? +profileItemReviewsCountValue : 0,
        }

        return profileItemData
    }

    protected async parseProfiles(requestType: 'first' | 'next') {
        await wait(randomNumberBetween(2, 10) * 1000)
        await this.apiGetAdds(requestType)
    }

    protected async apiGetAdds(requestType: 'first' | 'next') {
        if (requestType === 'first') {
            this.currentPageNumber = +this.pagesRange.start
        }
        
        if (requestType === 'next') {
            this.currentPageNumber += 1
        }

        sendMessage({
            action: 'profiles-parsing-current-page',
            status: 'success',
            currentUrl: this.currentURL,
            data: this.currentPageNumber
        });

        let urlObj = new URL(this.currentURL)
        urlObj.searchParams.delete('p')

        if (this.currentPageNumber !== 1) {
            urlObj.searchParams.set('p', `${this.currentPageNumber}`)
        }

        try {

            let pageReqest = await fetch(urlObj.toString())
            let pageHTMLText = await pageReqest.text()

            let parser = new DOMParser().parseFromString(pageHTMLText, "text/html")
            let profilesEls = parser.body.querySelectorAll(this.SELECTORS.profileItem)

            profilesEls.forEach(item => {
                let profileItemData = this.makeProfileItemData(item as HTMLElement)
                this.profilesCollection.push(profileItemData)
            })

            if (this.currentPageNumber === +this.pagesRange.end) {
                await sendMessage({
                    action: 'profiles-parsing-ended',
                    status: 'success',
                    currentUrl: this.currentURL,
                    data: this.getFilteredList()
                });
            } else {
                this.parseProfiles('next')
            }

        } catch(error: any) {
            await sendMessage({
                action: 'profiles-parsing-ended',
                status: 'error',
                currentUrl: this.currentURL,
            });

        } finally {

        }
    }

    public async parsingStart() {
        await sendMessage({
            action: 'profiles-parsing-started',
            status: 'success',
            currentUrl: this.currentURL,
        });

        this.parseProfiles('first')
    }
}

chrome.runtime.onMessage.addListener(async ({
    action,
    currentUrl,
    reviewsFilterFields, 
    profilesFilterFields
}) => {
    if (action === 'profiles-parsing-start') {
        await wait(1000)
        new ProfilesFactory(profilesFilterFields, currentUrl).parsingStart()
        return
    }

    if (action === 'reviews-parsing-start' && reviewsFilterFields) {
        await wait(1000)
        getProfileInfo(currentUrl)
        new ReviewsFactory(reviewsFilterFields, currentUrl).parsingStart()
    }
})