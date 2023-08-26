import { reactive, ref } from 'vue'
import { createTab } from '@/helpers/common';
import { toast } from '@/helpers/toast';
import { MessagesEnum } from '@/types/enums';

export interface IProfileFilterFields {
    categoryUrl: string
    profileName: string
    pageTitle: string
    pageStart: number
    pageEnd: number
    reviewsCount: number
}

class ProfilesFilter {
    public openedTab = ref<Record<string, any>>({})

    public fields = reactive<IProfileFilterFields>({
        pageTitle: '',
        reviewsCount: 100,
        categoryUrl: '',
        profileName: '',
        pageStart: 1,
        pageEnd: 10
    })

    public async parsingStart() {
        this.apiCreateFilter()

        const currentTab = await createTab(this.fields.categoryUrl)
        this.openedTab.value = currentTab

        if (currentTab.id) {
            chrome.tabs.sendMessage(currentTab.id, {
                action: 'profiles-parsing-start',
                profilesFilterFields: this.fields,
                currentUrl: this.fields.categoryUrl
            })
        }
    }

    public async resetFields() {
        this.fields.pageTitle = ''
        this.fields.reviewsCount = 100
        this.fields.categoryUrl = ''
        this.fields.profileName = ''
        this.fields.pageStart = 1
        this.fields.pageEnd = 10
    }

    public async setFilterFromDB() {
        try {
            const result = await this.apiGetFilter()

            if (result) {
                this.fields.categoryUrl = result.categoryUrl
                this.fields.pageEnd = result.pageEnd
                this.fields.pageStart = result.pageStart
                this.fields.profileName = result.profileName
                this.fields.reviewsCount = result.reviewsCount
                this.fields.pageTitle = result.pageTitle

                return result
            }

        } catch(error: any) {
            console.log(error);
            toast.show('error', MessagesEnum.ProfilesSearchFilterGetError)
        } finally {

        }
    }

    public async apiRemoveFilter() {
        try {
            await chrome.storage.local.remove('searchFilter')

        } catch(error: any) {
            console.log(error);
            toast.show('error', MessagesEnum.ProfilesSearchFilterClearError)
        }
    }

    public async apiGetFilter(): Promise<IProfileFilterFields | null> {
        const { searchFilter } = await chrome.storage.local.get('searchFilter')

        if (searchFilter) {
            return searchFilter
        }
        
        return null
    }

    public async apiCreateFilter() {
        try {
            const copyFilter = JSON.parse(JSON.stringify(this.fields))

            await chrome.storage.local.set({'searchFilter': copyFilter})

        } catch(error: any){
            console.log(error)
            toast.show('error', MessagesEnum.ProfilesSearchFilterSaveError)
        }
    }
}

export const profilesFilter = new ProfilesFilter()