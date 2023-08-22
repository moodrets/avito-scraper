import { reactive } from "vue"
import { profileSavedList } from "@/reactive/useProfileSavedList"
import { reviewsFilter } from "@/reactive/useReviewsFilter"
import { isEqual, orderBy, uniqWith } from 'lodash'

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
        let resultArray: IProfileInAdd[] = []

        if (sortType === 'name_desc') {
            resultArray = orderBy(copyArray, ['name'], ['desc'])
        }
        
        if (sortType === 'name_asc') {
            resultArray = orderBy(copyArray, ['name'], ['asc'])
        }

        if (sortType === 'rating_desc') {
            resultArray = orderBy(copyArray, ['rating'], ['desc'])
        }

        if (sortType === 'rating_asc') {
            resultArray = orderBy(copyArray, ['rating'], ['asc'])
        }

        if (sortType === 'reviews_desc') {
            resultArray = orderBy(copyArray, ['reviewsCount'], ['desc'])
        }

        if (sortType === 'reviews_asc') {
            resultArray = orderBy(copyArray, ['reviewsCount'], ['asc'])
        }

        if (sortType === 'db_exist_desc') {
            resultArray = orderBy(copyArray, ['existsInDataBase'], ['desc', 'asc'])
        }

        if (sortType === 'db_exist_asc') {
            resultArray = orderBy(copyArray, ['existsInDataBase'], ['asc', 'desc'])
        }

        this.state.profilesList = []

        this.state.profilesList = resultArray
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
        let resultArr = uniqWith(profilesList, isEqual)
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