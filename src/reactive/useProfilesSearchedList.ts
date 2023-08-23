import { reactive, ref } from "vue"
import { profileSavedList } from "@/reactive/useProfileSavedList"
import { reviewsFilter } from "@/reactive/useReviewsFilter"
import { isEqual, orderBy, uniqWith } from 'lodash'
import DB from "@/db/db"
import { toast } from "@/helpers/toast"
import { MessagesEnum } from "@/types/enums"

export interface IProfileInAdd {
    url: string
    name: string
    rating: number
    reviewsCount: number
    existsInDataBase: boolean
}

export class ProfilesSearchedList {

    public list = ref<IProfileInAdd[]>([])

    public state = reactive<{
        loading: boolean,
        currentPage: number,
        profilesListSortType: string,
        profilesInParsingFilter: {
            [key: string]: IProfileInAdd
        }
    }>({
        loading: false,
        currentPage: 0,
        profilesListSortType: 'name_asc',
        profilesInParsingFilter: {} 
    })

    public sortProfileList(sortType: string = 'name_asc') {
        this.state.profilesListSortType = sortType
        let copyArray = JSON.parse(JSON.stringify(this.list.value)) as IProfileInAdd[]
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

        this.list.value = []

        this.list.value = resultArray
    }

    public async checkProfilesInDB() {
        let dbProfileList = await profileSavedList.apiGetList()

        this.list.value.forEach(profile => {
            let profileUrlHash = profile.url.split('/')[4]
            if (profileUrlHash) {
                let foundInDb = dbProfileList.find(item => item.url.includes(profileUrlHash))
                if (foundInDb && foundInDb.name === profile.name) {
                    profile.existsInDataBase = true
                }
            }
        })
    }

    public pushProfilesList(profilesList: IProfileInAdd[]) {
        let resultArr = uniqWith(profilesList, isEqual)
        this.list.value = resultArr
        this.sortProfileList()
        this.checkProfilesInDB()
        this.checkProfileInParsingFilter()
    }

    public checkProfileInParsingFilter() {
        this.list.value.forEach(profile => {
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
            this.list.value = []
            this.state.profilesInParsingFilter = {}
            this.apiRemoveList()
        }
    }

    public checkProfilesInParsingFilter() {
        let paringFilterLinks = reviewsFilter.fields.profilesLinks 

        paringFilterLinks.forEach(link => {
            let foundProfileByUrl = this.list.value.find(profile => profile.url === link.url)
            if (foundProfileByUrl) {
                this.state.profilesInParsingFilter[foundProfileByUrl.url] = foundProfileByUrl
            }
        })
    }

    public async apiCreateList(): Promise<void> {
        try {

            let copyArray = JSON.parse(JSON.stringify(this.list.value))

            if (copyArray.length) {
                DB.profilesSearchedList.clear()
                DB.profilesSearchedList.bulkAdd(copyArray)
                toast.show('success', MessagesEnum.ProfilesSearchedListCreated)
            }

        } catch(error: any) {
            console.log(error);
        } finally {

        }
    }

    public async apiGetList(): Promise<IProfileInAdd[]> {
        try {

            const rows = await DB.profilesSearchedList.toArray()

            if (rows.length) {
                return rows
            }

        } catch(error: any) {
            console.log(error);
        } finally {
            
        }

        return []
    }

    public async apiRemoveList(): Promise<void> {
        try {
            await DB.profilesSearchedList.clear()
            toast.show('warning', MessagesEnum.ProfileInfoListRemovedFromDB)

        } catch(error: any) {
            console.log(error);
        } finally {
            
        }
    }
}

export const profilesSearchedList = new ProfilesSearchedList()