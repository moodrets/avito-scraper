import DB from "@/db/db"
import { ref, computed } from "vue"
import { toast } from "@/helpers/toast"
import { MessagesEnum } from "@/types/enums"
import { IProfileItem, profilesParsedList } from "@/reactive/useProfilesParsedList"
import { getProfileUrlHash } from "@/helpers/common"
import { profilesSavedFilter } from "@/reactive/useProfilesSavedFilter"

export interface IParsingResultItem {
    parsingDate: number
    rating: string
    reviewsCount: string
    subscribers: string
    deliveryInfo: string
    activeAdds: string
    completedAdds: string
}

export interface IProfileItemDB {
    id?: number
    url: string
    name: string
    comment: string
    savedDate: number
    loading: boolean
    opened: boolean
    parsingResults: IParsingResultItem[]
}

class ProfilesSavedList {
    public list = ref<IProfileItemDB[]>([])

    public filteredList = computed<IProfileItemDB[]>(() => {
        let list = [...this.list.value]

        if (profilesSavedFilter.fields.name) {
            return list.filter(profile => {
                let profileNameLC = profile.name.toLowerCase()
                let filterNameLC = profilesSavedFilter.fields.name.toLowerCase()

                if (profileNameLC.includes(filterNameLC)) {
                    return profile
                }
            })
        }

        if (profilesSavedFilter.fields.comment) {
            return list.filter(profile => {
                let profileCommentLC = profile.comment.toLowerCase()
                let filterCommentLC = profilesSavedFilter.fields.comment.toLowerCase()

                if (profileCommentLC.includes(filterCommentLC)) {
                    return profile
                }
            })
        }

        return list
    })

    public getLastParsingInfo(profile: IProfileItemDB) {
        return this.list.value.find(item => item.url === profile.url)?.parsingResults[0]
    }

    public async pushParsingResult(url: string) {
        try {

            let profileInfoByUrl = profilesParsedList.list.value.find(item => item.url === url)
            let rows = await DB.profilesSavedList.where("url").equals(url).toArray()

            if (rows.length && rows[0] && profileInfoByUrl) {
                let copyProfileByUrl = JSON.parse(JSON.stringify(profileInfoByUrl))
                let resultProfile: IProfileItemDB = rows[0]

                resultProfile.parsingResults.unshift({
                    parsingDate: copyProfileByUrl.parsingDate,
                    rating: copyProfileByUrl.rating,
                    reviewsCount: copyProfileByUrl.reviewsCount,
                    deliveryInfo: copyProfileByUrl.deliveryInfo,
                    subscribers: copyProfileByUrl.subscribers,
                    activeAdds: copyProfileByUrl.activeAdds,
                    completedAdds: copyProfileByUrl.completedAdds,
                })

                const result = await DB.profilesSavedList.put(resultProfile)
            }

        } catch (error: any) {
            console.log(error);
        } finally {

        }
    }

    public async apiGetProfileByUrl(url: string): Promise<IProfileItemDB | null> {
        try {

            let rows = await DB.profilesSavedList.where("url").equals(url).toArray()

            if (rows.length && rows[0]) {
                return rows[0]
            }

        } catch (error: any) {
            console.log(error);
        } finally {

        }

        return null
    }

    public async apiGetList(offset: number = 0, limit: number = 0): Promise<IProfileItemDB[]> {
        if (offset === 0 && limit === 0) {
            return await DB.profilesSavedList.toArray()
        }
        
        return []
    }

    public async apiUpdateList() {
        try {

            const copyArray = JSON.parse(JSON.stringify(this.list.value)) as IProfileItemDB[]
            copyArray.forEach(profile => profile.opened = false)
            copyArray.forEach(profile => delete profile.id)

            await DB.profilesSavedList.clear()
            await DB.profilesSavedList.bulkAdd(copyArray)

        } catch(error: any) {
            console.error(error);
            toast.show('error', MessagesEnum.ProfilesListUpdateError)
        } finally {

        }
    }

    public async apiProfileGetByURLHash(profile: IProfileItem) {
        try {
            
            let urlHash = getProfileUrlHash(profile.url)
            
            let rows = await DB.profilesSavedList.filter((profile: IProfileItemDB) => profile.url.includes(urlHash)).toArray()

            if (rows.length && rows[0]) {
                return rows[0]
            }

        } catch(error) {
            console.error(error);
        }

        return null
    }

    public async apiProfileCreate(profile: IProfileItem) {
        try {

            let profileByUrlHash = await this.apiProfileGetByURLHash(profile);

            if (profileByUrlHash) {
                throw new Error('Такой профиль уже есть в базе')
            }

            let copyProfile = JSON.parse(JSON.stringify(profile))

            let newProfile: IProfileItemDB = {
                url: copyProfile.url,
                name: copyProfile.name,
                comment: copyProfile.comment,
                savedDate: Date.now(),
                opened: false,
                loading: false,
                parsingResults: [
                    {
                        parsingDate: copyProfile.parsingDate,
                        rating: copyProfile.rating,
                        reviewsCount: copyProfile.reviewsCount,
                        deliveryInfo: copyProfile.deliveryInfo,
                        subscribers: copyProfile.subscribers,
                        activeAdds: copyProfile.activeAdds,
                        completedAdds: copyProfile.completedAdds,
                    }
                ]
            }

            const resultID = await DB.profilesSavedList.add(newProfile)

            profile.existsInDataBase = true
            profile.savedDate = newProfile.savedDate
            profile.comment = newProfile.comment

        } catch(error: any) {
            console.log(error);
            toast.show('error', MessagesEnum.ProfileCreateError)
        } finally {
            
        }
    }

    public async apiProfileUpdate(profile: IProfileItemDB) {
        try {

            let copyProfile = JSON.parse(JSON.stringify(profile))
            copyProfile.opened = false
            copyProfile.loading = false
    
            const result = await DB.profilesSavedList.put(copyProfile);

            if (result) {
            } else {
                throw new Error()
            }

        } catch(error: any) {
            toast.show('error', MessagesEnum.ProfileEditeError)
            
        } finally {

        }
    }
    
    async apiProfileDelete(profile: IProfileItemDB) {
        try {
            await DB.profilesSavedList.delete(profile.id)
        } catch(error: any) {
            console.log(error);
            toast.show('error', MessagesEnum.ProfileDeleteError)
        } finally {

        }
    }
}

export const profilesSavedList = new ProfilesSavedList()