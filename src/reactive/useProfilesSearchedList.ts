import { reactive } from "vue"
import { profileSavedList } from "@/reactive/useProfileSavedList"
import { reviewsFilter } from "@/reactive/useReviewsFilter"

export interface IProfileInAdd {
    url: string
    name: string
    rating: number
    reviewsCount: number
    existsInDataBase: boolean
}

export class ProfilesSearchedList {
    public state = reactive<{
        loading: boolean,
        currentPage: number,
        profilesListSortType: string,
        profilesList: IProfileInAdd[],
        profilesInParsingFilter: {
            [key: string]: IProfileInAdd
        }
    }>({
        loading: false,
        currentPage: 0,
        profilesListSortType: 'name_asc',
        profilesList: [],
        profilesInParsingFilter: {} 
    })

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

        this.state.profilesList = [...copyArray]
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
        this.checkProfileInParsingFilter()
    }

    public checkProfileInParsingFilter() {
        this.state.profilesList.forEach(profile => {
            let findProfileInParsingFilter = reviewsFilter.profileLinkGetByUrl(profile.url)
            if (findProfileInParsingFilter) {
                this.state.profilesInParsingFilter[profile.url] = profile     
            }
        })
    }

    public removeLinksFromParsingFilter(url: string) {
        delete this.state.profilesInParsingFilter[url]
    }

    public clearProfilesList() {
        if (window.confirm('Удаляем список продавцов ?')) {
            this.state.profilesList = []
            this.state.profilesInParsingFilter = {}
        }
    }
}

export const profilesSearchedList = new ProfilesSearchedList()