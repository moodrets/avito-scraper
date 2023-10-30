import { reactive, ref } from "vue"
import { orderBy, uniqBy } from 'lodash'
import { profilesSavedList } from '@/reactive/useProfileSavedList'
import { reviewsFilter } from '@/reactive/useReviewsFilter'
import { getProfileUrlHash } from "@/helpers/common"

export interface IProfileInAdd {
    url: string
    name: string
    rating: number
    reviewsCount: number
    price: number
    existsInDataBase: boolean
}

export class ProfilesSearchedList {

    public list = ref<IProfileInAdd[]>([])

    public state = reactive<{
        loading: boolean,
        profilesListSortType: string,
        profilesInParsingFilter: {
            [key: string]: IProfileInAdd
        },
        checkedItems: {
            [key: string]: IProfileInAdd
        },
    }>({
        loading: false,
        profilesListSortType: 'name_asc',
        profilesInParsingFilter: {},
        checkedItems: {} 
    })

    public sortProfileList(sortType: string = 'name_asc') {
        this.state.profilesListSortType = sortType
        let copyArray = JSON.parse(JSON.stringify(this.list.value)) as IProfileInAdd[]
        let resultArray: IProfileInAdd[] = []

        if (sortType === 'price_desc') {
            resultArray = orderBy(copyArray, ['price'], ['desc'])
        }
        
        if (sortType === 'price_asc') {
            resultArray = orderBy(copyArray, ['price'], ['asc'])
        }

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

        this.list.value = resultArray
    }

    public async checkProfilesInDB() {
        let dbProfileList = await profilesSavedList.apiGetList()

        this.list.value.forEach(profile => {

            let profileUrlHash = getProfileUrlHash(profile.url)

            if (profileUrlHash) {
                let foundInDb = dbProfileList.find(item => item.url.includes(profileUrlHash))
                if (foundInDb && foundInDb.name === profile.name) {
                    profile.existsInDataBase = true
                }
            }
        })
    }

    public async pushProfilesList(profilesList: IProfileInAdd[]) {
        let mergeProfiles = [...profilesList, ...this.list.value]
        let resultArr = uniqBy(mergeProfiles, 'url')
        this.list.value = resultArr
        this.sortProfileList()
        await this.checkProfilesInDB()
        this.checkProfilesInParsingFilter()
    }

    public checkProfilesInParsingFilter() {
        let paringFilterLinks = reviewsFilter.fields.profilesLinks 

        paringFilterLinks.forEach(link => {
            let profileURLHash = getProfileUrlHash(link.url)
            let foundProfileByUrlHash = this.list.value.find(profile => profile.url.includes(profileURLHash))
            if (foundProfileByUrlHash) {
                this.state.profilesInParsingFilter[foundProfileByUrlHash.url] = foundProfileByUrlHash
            }
        })
    }

    public removeLinkFromParsingFilter(url: string) {
        delete this.state.profilesInParsingFilter[url]
    }

    public clearProfilesList() {
        if (window.confirm('Удаляем список продавцов ?')) {
            this.list.value = []
            this.state.profilesInParsingFilter = {}
            this.apiRemoveList()
        }
    }

    public async apiCreateList(): Promise<void> {
        try {

            let copyArray = JSON.parse(JSON.stringify(this.list.value))

            if (copyArray.length) {
                await chrome.storage.local.set({'profilesSearchedList': copyArray})
            }

        } catch(error: any) {
            console.log(error);
        } finally {

        }
    }

    public async apiGetList(): Promise<IProfileInAdd[]> {
        try {

            const { profilesSearchedList } = await chrome.storage.local.get('profilesSearchedList')

            if (profilesSearchedList) {
                return profilesSearchedList
            }

        } catch(error: any) {
            console.log(error);
        } finally {
            
        }

        return []
    }

    public async apiRemoveList(): Promise<void> {
        try {
            await chrome.storage.local.remove('profilesSearchedList')

        } catch(error: any) {
            console.log(error);
        } finally {
            
        }
    }
}

export const profilesSearchedList = new ProfilesSearchedList()