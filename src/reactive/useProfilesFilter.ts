import { reactive, ref, computed } from 'vue'
import { createTab } from '@/helpers/common';

export interface IProfileFilterFields {
    categoryUrl: string,
    profileName: string,
    pagesRange: string,
    reviewsCount: number,
}

export interface IProfileInAdd {
    url: string
    name: string
    rating: string
    reviewsCount: number
}

class ProfilesFilter {
    public openedTab = ref<Record<string, any>>({})

    public state = reactive<{
        loading: boolean,
        currentPage: number,
        profilesList: IProfileInAdd[]
    }>({
        loading: false,
        currentPage: 0,
        profilesList: []
    })

    public pagesRange = computed<{start: number, end: number}>(() => {
        let split = this.fields.pagesRange.split('-')
        let start = +split[0]
        let end = +split[1]
        return {
            start,
            end  
        }
    })

    public fields = reactive<IProfileFilterFields>({
        reviewsCount: 100,
        categoryUrl: '',
        profileName: '',
        pagesRange: '1-20'
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

    public pushProfileList(profilesList: IProfileInAdd[]) {
        let resultArr:any = [...profilesList, ...this.state.profilesList]
        resultArr = new Set(resultArr.map((item: any) => JSON.stringify(item)))
        resultArr = [...resultArr].map(item => JSON.parse(item))
        this.state.profilesList = resultArr
    }
}

export const profilesFilter = new ProfilesFilter()