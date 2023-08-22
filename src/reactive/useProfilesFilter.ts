import DB from '@/db/db';
import { reactive, ref } from 'vue'
import { createTab } from '@/helpers/common';
import { toast } from '@/helpers/toast';
import { MessagesEnum } from '@/types/enums';

export interface IProfileFilterFields {
    categoryUrl: string
    profileName: string
    pageStart: number
    pageEnd: number
    reviewsCount: number
}

class ProfilesFilter {
    public openedTab = ref<Record<string, any>>({})

    public fields = reactive<IProfileFilterFields>({
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

    public async setFilterFromDB() {
        try {
            const result = await this.apiGetFilter()

            if (result) {
                this.fields.categoryUrl = result.categoryUrl
                this.fields.pageEnd = result.pageEnd
                this.fields.pageStart = result.pageStart
                this.fields.profileName = result.profileName
                this.fields.reviewsCount = result.reviewsCount

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
            await DB.profilesSearchFilter.clear()
            toast.show('warning', MessagesEnum.ProfilesSearchFilterCleared)

        } catch(error: any) {
            console.log(error);
            toast.show('warning', MessagesEnum.ProfilesSearchFilterClearError)
        }
    }

    public async apiGetFilter() {
        const rows = await DB.profilesSearchFilter.toArray()

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

            await DB.profilesSearchFilter.clear()
            await DB.profilesSearchFilter.add(copyFilter)

            toast.show('success', MessagesEnum.ProfilesSearchFilterSaved)
    
        } catch(error: any){
            console.log(error)
            toast.show('error', MessagesEnum.ProfilesSearchFilterSaveError)
        }
    }
}

export const profilesFilter = new ProfilesFilter()