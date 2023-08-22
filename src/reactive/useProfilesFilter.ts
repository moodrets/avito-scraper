import { reactive, ref, computed } from 'vue'
import { createTab } from '@/helpers/common';

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
}

export const profilesFilter = new ProfilesFilter()