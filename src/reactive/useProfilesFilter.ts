import { reactive, ref, computed } from 'vue'
import { createTab } from '@/helpers/common';
import { profileSavedList } from '@/reactive/useProfileSavedList';

export interface IProfileFilterFields {
    categoryUrl: string
    profileName: string
    pagesRange: string
    reviewsCount: number
}

export interface IProfileInAdd {
    url: string
    name: string
    rating: number
    reviewsCount: number
    existsInDataBase: boolean
}

class ProfilesFilter {
    public openedTab = ref<Record<string, any>>({})

    public state = reactive<{
        loading: boolean,
        currentPage: number,
        profilesListSortType: string,
        profilesList: IProfileInAdd[],
    }>({
        loading: false,
        currentPage: 0,
        profilesListSortType: 'name_asc',
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

    public sortProfileList(sortType: string = 'name_asc') {
        this.state.profilesListSortType = sortType
        let copyArray = JSON.parse(JSON.stringify(this.state.profilesList)) as IProfileInAdd[]

        if (sortType === 'name_desc') {
            copyArray.sort((a, b) => b.name.localeCompare(a.name))
        }
        
        if (sortType === 'name_asc') {
            copyArray.sort((a, b) => a.name.localeCompare(b.name))
        }

        if (sortType === 'rating_desc') {
            copyArray.sort((a, b) => a.rating > b.rating ? -1 : a.rating < b.rating ? 1 : 0)
        }

        if (sortType === 'rating_asc') {
            copyArray.sort((a, b) => a.rating > b.rating ? 1 : a.rating < b.rating ? -1 : 0)
        }

        if (sortType === 'reviews_desc') {
            copyArray.sort((a, b) => a.reviewsCount > b.reviewsCount ? -1 : a.reviewsCount < b.reviewsCount ? 1 : 0)
        }

        if (sortType === 'reviews_asc') {
            copyArray.sort((a, b) => a.reviewsCount > b.reviewsCount ? 1 : a.reviewsCount < b.reviewsCount ? -1 : 0)
        }

        if (sortType === 'db_exist_desc') {
            copyArray.sort((a, b) => Number(b.existsInDataBase) - Number(a.existsInDataBase))
        }

        if (sortType === 'db_exist_asc') {
            copyArray.sort((a, b) => Number(a.existsInDataBase) - Number(b.existsInDataBase))
        }

        this.state.profilesList = []

        setTimeout(()=>{
            this.state.profilesList = [...copyArray]
        }, 0)
    }

    public async checkProfilesInDB() {
        let dbProfileList = await profileSavedList.apiGetList()

        this.state.profilesList.forEach(profile => {
            let profileUrlHash = profile.url.split('/')[4]
            if (profileUrlHash) {
                let foundInDb = dbProfileList.find(item => item.url.includes(profileUrlHash))
                if (foundInDb && foundInDb.name === profile.name) {
                    profile.existsInDataBase = true
                }
            }
        })
    }

    public pushProfileList(profilesList: IProfileInAdd[]) {
        let resultArr:any = [...profilesList, ...this.state.profilesList]
        resultArr = new Set(resultArr.map((item: any) => JSON.stringify(item)))
        resultArr = [...resultArr].map(item => JSON.parse(item))
        this.state.profilesList = resultArr
        this.sortProfileList()
        this.checkProfilesInDB()
    }

    public clearProfilesList() {
        if (window.confirm('Удаляем список продавцов ?')) {
            this.state.profilesList = []
        }
    }
}

export const profilesFilter = new ProfilesFilter()