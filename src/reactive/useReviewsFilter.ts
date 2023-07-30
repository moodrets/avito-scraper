import { reactive, ref } from "vue"
import DB from "@/db/db"
import { toast } from "@/helpers/toast"
import { MessagesEnum } from "@/types/enums"
import { dateFromDatepickerString } from "@/helpers/date"
import { createTab } from "@/helpers/common"

export interface IProfileLink {
    status: 'success' | 'error' | 'wait' | 'new',
    url: string,
    info?: string
}

export interface IReviewsFilterFields {
    profilesLinks: IProfileLink[]
    productName: string
    dateFrom: string
    dateTo: string
    ratingFrom: number
    ratingTo: number
    scrollInterval: number
    deliveryOnly: false
}

class ReviewsFilter {
    public fields = reactive({
        profilesLinks: [
            {url: '', status: 'new'},
        ],
        productName: '',
        dateFrom: '',
        dateTo: '',
        ratingFrom: 4,
        ratingTo: 5,
        scrollInterval: 2,
        openTabInterval: 2,
        deliveryOnly: false,
    }) as IReviewsFilterFields

    public openedTab = ref<Record<string, any>>({})

    get newProfileLink(): IProfileLink | undefined {
        return this.fields.profilesLinks.find((item) => item.status === 'new')
    }

    public getProfileLinkByUrl(url: string): IProfileLink | undefined {
        return this.fields.profilesLinks.find((item) => item.url === url)
    }

    public pushNewProfileLink(): void {
        this.fields.profilesLinks.push({
            url: '', 
            status: 'new'
        })
    }

    public removeProfileLink(index: number) {
        this.fields.profilesLinks.splice(index, 1)
    }

    public setProfileLinksStatusNew(): void {
        this.fields.profilesLinks.forEach(link => {
            link.info = ''
            link.status = 'new'
        })
    }

    public setProfileLinkInfo(url: string, data: string) {
        const linkByUrl = this.getProfileLinkByUrl(url)

        if (linkByUrl) {
            linkByUrl.info = data
        }
    }

    public async setFilterFromDB() {
        try {
            const result = await this.apiGetFilter()

            if (result) {
                this.fields.profilesLinks = result.profilesLinks
                this.fields.ratingFrom = result.ratingFrom
                this.fields.ratingTo = result.ratingTo
                this.fields.deliveryOnly = result.deliveryOnly
                this.fields.productName = result.productName
                this.fields.scrollInterval = result.scrollInterval

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
            {url: '', status: 'new'},
        ]
        this.fields.productName = ''
        this.fields.dateFrom = ''
        this.fields.dateTo = ''
        this.fields.ratingFrom = 4
        this.fields.ratingTo = 5
        this.fields.scrollInterval = 2
        this.fields.deliveryOnly = false
        
        await this.apiRemoveFilter()
    }

    public async parsingStart() {
        try {

            if (this.newProfileLink) {
                const currentTab = await createTab(this.newProfileLink.url)
                this.openedTab.value = currentTab
    
                if (currentTab.id) {
                    chrome.tabs.sendMessage(currentTab.id, {
                        action: 'reviews-parsing-start',
                        reviewsFilterFields: this.fields,
                        currentUrl: this.newProfileLink.url
                    })
                }
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
            copyFilter.profilesLinks.forEach((link: IProfileLink) => link.status = 'new')

            const rows = await DB.reviewsFilter.where("key").equals('reviewsFilter').toArray()

            if (rows.length) {
                DB.reviewsFilter.update('reviewsFilter', {...copyFilter, key: 'reviewsFilter'})
            } else {
                DB.reviewsFilter.add({...copyFilter, key: 'reviewsFilter'})
            }

            toast.show('success', MessagesEnum.ReviewsFilterSaved)
    
        } catch(error: any){
            console.log(error)
            toast.show('success', MessagesEnum.ReviewsFilterSaveError)
        }
    }
}

export const reviewsFilter = new ReviewsFilter()