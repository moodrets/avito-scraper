import DB from "@/db/db"
import { ref } from "vue"
import { toast } from "@/helpers/toast"
import { MessagesEnum } from "@/types/enums"
import { profileInfoList } from "@/reactive/useProfileInfoList"

export interface IParsingResultItem {
    parsingDate: number
    rating: string
    reviewsCount: string
    subscribers: string
    deliveryInfo: string
}

export interface IProfileItemDB {
    id?: number
    url: string
    name: string
    comment: string
    savedDate: number
    parsingResults: IParsingResultItem[]
    loading: boolean
    opened: boolean
}

class ProfileSavedList {
    public list = ref<IProfileItemDB[]>([])

    public getLastParsingInfo(profile: IProfileItemDB) {
        return this.list.value.find(item => item.url === profile.url)?.parsingResults[0]
    }

    public async pushParsingResult(url: string) {
        try {

            let profileInfoByUrl = profileInfoList.list.value.find(item => item.url === url)
            let rows = await DB.savedProfiles.where("url").equals(url).toArray()

            if (rows.length && rows[0] && profileInfoByUrl) {
                let copyProfileByUrl = JSON.parse(JSON.stringify(profileInfoByUrl))
                let resultProfile: IProfileItemDB = rows[0]

                resultProfile.parsingResults.unshift({
                    parsingDate: copyProfileByUrl.parsingDate,
                    rating: copyProfileByUrl.rating,
                    reviewsCount: copyProfileByUrl.reviewsCount,
                    deliveryInfo: copyProfileByUrl.deliveryInfo,
                    subscribers: copyProfileByUrl.subscribers
                })

                const result = await DB.savedProfiles.put(resultProfile)
            }

        } catch (error: any) {
            console.log(error);
        } finally {

        }
    }

    public async apiGetList(offset: number = 0, limit: number = 0) {
        if (offset === 0 && limit === 0) {
            this.list.value = await DB.savedProfiles.toArray()
        }
    }

    async apiProfileUpdate(profile: IProfileItemDB) {
        try {

            let copyProfile = JSON.parse(JSON.stringify(profile))
            copyProfile.opened = false
            copyProfile.loading = false
    
            const result = await DB.savedProfiles.put(copyProfile);

            if (result) {
                toast.show('success', MessagesEnum.ProfileEdited)
            } else {
                throw new Error()
            }

        } catch(error: any) {
            toast.show('success', MessagesEnum.ProfileEditeError)
            
        } finally {

        }
    }
    
    async apiProfileDelete(profile: IProfileItemDB) {
        try {
            await DB.savedProfiles.delete(profile.id)
            toast.show('success', MessagesEnum.ProfileDeleted)
        } catch(error: any) {
            console.log(error);
            toast.show('error', MessagesEnum.ProfileDeleteError)
        } finally {

        }
    }
}

export const profileSavedList = new ProfileSavedList()