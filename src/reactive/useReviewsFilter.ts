import DB from "@/db/db"
import { reactive, ref } from "vue"
import { toast } from "@/helpers/toast"
import { MessagesEnum } from "@/types/enums"
import { dateFromDatepickerString } from "@/helpers/date"
import { createTab } from "@/helpers/common"
import { profileInfoList } from "@/reactive/useProfileInfoList"
import { profilesSearchedList } from "./useProfilesSearchedList"

export interface IProfileLink {
    status: 'success' | 'error' | 'wait' | 'new'
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

    public profileLinkRemove(link: IProfileLink, index: number) {
        profilesSearchedList.removeLinksFromParsingFilter(link.url)
        if (this.fields.profilesLinks.length === 1) {
            this.fields.profilesLinks[0].url = ''
        } else {
            this.fields.profilesLinks.splice(index, 1)
        }
        this.profileLinksHighlightDuplicates()
    }

    public profileLinksHighlightDuplicates() {
        this.fields.profilesLinks.forEach((link, index, array) => {
            let duplicates = array.filter(filterLink => filterLink.url === link.url && link.url !== '')
            link.highlight = duplicates.length > 1
        })
    }

    public profileLinkSetInfo(url: string, data: string) {
        const linkByUrl = this.profileLinkGetByUrl(url)

        if (linkByUrl) {
            linkByUrl.info = data
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
        
        await this.apiRemoveFilter()
    }

    public async parsingStart() {
        try {

            if (this.profileLinkNew) {

                // чистим результаты парсинга в соответствии с урлами фильтра
                const profileUrlsFromFilter = this.fields.profilesLinks.map(item => item.url)
                profileInfoList.list.value = profileInfoList.list.value.filter(profile => profileUrlsFromFilter.includes(profile.url) || profile.marked)

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

    public async apiRemoveFilter() {
        try {
            await DB.reviewsFilter.where('key').equals('reviewsFilter').delete()
            toast.show('warning', MessagesEnum.ReviewsFilterCleared)

        } catch(error: any) {
            console.log(error);
            toast.show('warning', MessagesEnum.ReviewsFilterClearError)
        }
    }

    public async apiGetFilter() {
        const rows = await DB.reviewsFilter.where('key').equals('reviewsFilter').toArray()

        if (rows.length && rows[0]) {
            const result = {...rows[0]}
            delete result.key
            return result
        }
        
        return null
    }

    public async apiCreateFilter() {
        try {
            const copyFilter = JSON.parse(JSON.stringify(this.fields))

            copyFilter.dateFrom = dateFromDatepickerString(copyFilter.dateFrom)
            copyFilter.dateTo = dateFromDatepickerString(copyFilter.dateTo)

            const rows = await DB.reviewsFilter.where("key").equals('reviewsFilter').toArray()

            if (rows.length) {
                DB.reviewsFilter.update('reviewsFilter', {...copyFilter, key: 'reviewsFilter'})
            } else {
                DB.reviewsFilter.add({...copyFilter, key: 'reviewsFilter'})
            }

            toast.show('success', MessagesEnum.ReviewsFilterSaved)
    
        } catch(error: any){
            console.log(error)
            toast.show('error', MessagesEnum.ReviewsFilterSaveError)
        }
    }
}

export const reviewsFilter = new ReviewsFilter()