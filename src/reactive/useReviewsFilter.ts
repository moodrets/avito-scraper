import { reactive, ref } from "vue"
import { toast } from "@/helpers/toast"
import { MessagesEnum } from "@/types/enums"
import { dateFromDatepickerString } from "@/helpers/date"
import { createTab } from "@/helpers/common"
import { IProfileItem, profilesParsedList } from "@/reactive/useProfilesParsedList"
import { profilesSearchedList } from "./useProfilesSearchedList"

export type TypeProfileLinkStatus = 'success' | 'error' | 'wait' | 'new'

export interface IProfileLink {
    status: TypeProfileLinkStatus
    url: string
    highlight: boolean
    info?: string
}

export interface IReviewsFilterFields {
    profilesLinks: IProfileLink[]
    productName: string
    dateFrom: string
    dateTo: string
    ratingFrom: number
    ratingTo: number
    deliveryOnly: boolean
    closeTabs: boolean
}

class ReviewsFilter {
    public fields = reactive<IReviewsFilterFields>({
        profilesLinks: [
            {url: '', status: 'new', highlight: false},
        ],
        productName: '',
        dateFrom: '',
        dateTo: '',
        ratingFrom: 4,
        ratingTo: 5,
        deliveryOnly: false,
        closeTabs: true
    }) as IReviewsFilterFields

    public openedTab = ref<Record<string, any>>({})

    public get profileLinkNew(): IProfileLink | undefined {
        return this.fields.profilesLinks.find((item) => item.status === 'new')
    }

    public get profileLinkHighlighted() {
        return this.fields.profilesLinks.find(item => item.highlight)
    }

    public profileLinkGetByUrl(url: string): IProfileLink | undefined {
        return this.fields.profilesLinks.find((item) => item.url === url)
    }

    public profileLinkPushNew(url: string = ''): void {
        this.fields.profilesLinks.push({
            url: url,
            status: 'new',
            highlight: false
        })
    }

    public profileLinksRemoveEmpty(): void {
        this.fields.profilesLinks.forEach((link, index, array) => {
            if (link.url === '') {
                array.splice(index, 1)
            }
        });
    }

    public profileLinkRemoveByUrl(link: string) {
        let findIndex = this.fields.profilesLinks.findIndex(profile => profile.url === link)
        
        if (findIndex !== -1) {
            this.fields.profilesLinks.splice(findIndex, 1)
            if (this.fields.profilesLinks.length === 0) {
                this.profileLinkPushNew('')
            }
        }
    }

    public profileLinkRemove(link: IProfileLink, index: number) {
        profilesSearchedList.removeLinkFromParsingFilter(link.url)
        if (this.fields.profilesLinks.length === 1) {
            this.fields.profilesLinks[0].url = ''
            this.fields.profilesLinks[0].status = 'new'
            this.fields.profilesLinks[0].info = ''
        } else {
            this.fields.profilesLinks.splice(index, 1)
        }
        this.profileLinksHighlightDuplicates()
    }

    public profileLinksRemoveAll() {
        this.fields.profilesLinks = []
        this.profileLinkPushNew('')
    }

    public profileLinksHighlightDuplicates() {
        this.fields.profilesLinks.forEach((link, index, array) => {
            let duplicates = array.filter(filterLink => filterLink.url === link.url && link.url !== '')
            link.highlight = duplicates.length > 1
        })
    }

    public profileLinkSetInfo(url: string, data: IProfileItem) {
        const linkByUrl = this.profileLinkGetByUrl(url)

        if (linkByUrl) {
            linkByUrl.info = `
                ${data.name}&nbsp;&nbsp;/&nbsp;&nbsp; 
                ${data.rating}&nbsp;&nbsp;/&nbsp;&nbsp; 
                ${data.reviewsCount}&nbsp;&nbsp;/&nbsp;&nbsp; 
                ${data.subscribers}&nbsp;&nbsp;/&nbsp;&nbsp; 
                ${data.deliveryInfo}&nbsp;&nbsp;/&nbsp;&nbsp;
                Активные ${data.activeAdds}
                ${data.completedAdds ? '&nbsp;&nbsp;/&nbsp;&nbsp; Завершенные ' + data.completedAdds : ''}
            `
        }
    }

    public profileLinksPasteMultiple(link: IProfileLink, target: HTMLInputElement) {
        let splitValue = target.value.split(' ')
        splitValue = splitValue.filter(url => url !== '')

        if (splitValue.length > 1) {
            splitValue.forEach((urlString, index) => {
                if (index === 0) {
                    link.url = urlString.trim()
                } else {
                    this.profileLinkPushNew(urlString.trim())
                }
            })
            return
        }

        link.url = target.value.trim()
    }

    public profileLinkSetStatus(url: string, status: TypeProfileLinkStatus) {
        const linkByUrl = this.profileLinkGetByUrl(url)
        if (linkByUrl) {
            linkByUrl.status = status
        }
    }

    public async setFilterFromDB() {
        try {
            const result = await this.apiGetFilter()

            if (result) {
                this.fields.profilesLinks = result.profilesLinks
                this.fields.ratingFrom = result.ratingFrom
                this.fields.ratingTo = result.ratingTo
                this.fields.productName = result.productName
                this.fields.deliveryOnly = result.deliveryOnly
                this.fields.closeTabs = result.closeTabs

                return result
            }

        } catch(error: any) {
            console.log(error);
            toast.show('error', MessagesEnum.ReviewsFilterGetError)
        } finally {

        }
    }

    public async parsingStart() {
        try {

            if (this.profileLinkNew) {

                // чистим результаты парсинга в соответствии с урлами фильтра
                const profileUrlsFromFilter = this.fields.profilesLinks.map(item => item.url)
                profilesParsedList.list.value = profilesParsedList.list.value.filter(profile => profileUrlsFromFilter.includes(profile.url) || profile.marked)

                const currentTab = await createTab(this.profileLinkNew.url)
                this.openedTab.value = currentTab
    
                if (currentTab.id) {
                    chrome.tabs.sendMessage(currentTab.id, {
                        action: 'reviews-parsing-start',
                        reviewsFilterFields: this.fields,
                        currentUrl: this.profileLinkNew.url
                    })
                }
            } else {
                toast.show('warning', MessagesEnum.ReviewsFilterAllLinksParsed)
            }
            
        } catch (error: any) {
            toast.show('error', MessagesEnum.TabOpenError)
        }
    }

    public async resetFields() {
        this.fields.profilesLinks = [
            {url: '', status: 'new', highlight: false},
        ]
        this.fields.productName = ''
        this.fields.dateFrom = ''
        this.fields.dateTo = ''
        this.fields.ratingFrom = 4
        this.fields.ratingTo = 5
        this.fields.deliveryOnly = false
        this.fields.closeTabs = true
    }

    public async apiGetFilter(): Promise<IReviewsFilterFields | null> {
        const { parsingFilter } = await chrome.storage.local.get('parsingFilter')

        if (parsingFilter) {
            return parsingFilter
        }
        
        return null
    }

    public async apiRemoveFilter() {
        try {
            await chrome.storage.local.remove('parsingFilter')

        } catch(error: any) {
            console.log(error);
            toast.show('error', MessagesEnum.ReviewsFilterClearError)
        }
    }

    public async apiCreateFilter() {
        try {
            const copyFilter = JSON.parse(JSON.stringify(this.fields))

            copyFilter.dateFrom = dateFromDatepickerString(copyFilter.dateFrom)
            copyFilter.dateTo = dateFromDatepickerString(copyFilter.dateTo)

            await chrome.storage.local.set({'parsingFilter': copyFilter})

        } catch(error: any){
            console.log(error)
            toast.show('error', MessagesEnum.ReviewsFilterSaveError)
        }
    }
}

export const reviewsFilter = new ReviewsFilter()