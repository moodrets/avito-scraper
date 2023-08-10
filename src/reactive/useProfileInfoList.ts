import DB from '@/db/db'
import { reactive, ref } from 'vue'
import { IProfileItemDB } from '@/reactive/useProfileSavedList'
import { toast } from '@/helpers/toast'
import { MessagesEnum } from '@/types/enums'
import { toLocaleString } from '@/helpers/date'
import { copyToBuffer } from '@/helpers/common'
import { profile } from 'console'

export type TypeReviewsSortBy = 'rating_desc' | 'rating_asc' | 'product_name_desc' | 'product_name_asc' | 'date_desc' | 'date_asc'

type TypeResultExtended = IReviewsItem & {
    color: {
        text: string,
        bg: string
    }, 
    info: string,
    count?: number
}

export interface IReviewsItem {
    date: number
    dateText: string
    productName: string
    delivery: boolean
    rating: number
    profileUrl: string
}

export interface IProfileItem {
    parsingDate: number
    url: string
    name: string
    rating: string
    reviewsCount: string
    subscribers: string
    deliveryInfo: string
    loading: boolean
    opened: boolean
    marked: boolean
    comment: string
    activeAdds: string,
    completedAdds: string,
    reviewsSortedBy: TypeReviewsSortBy
    color: {
        text: string,
        bg: string
    },
    id?: number
    existsInDataBase?: boolean
    savedDate?: number
    reviewsList?: IReviewsItem[]
}

class ProfileInfoList {
    public list = ref<IProfileItem[]>([])

    public state = reactive<{
        contentModalData: TypeResultExtended[],
        contentModalVisible: boolean
        viewAllButtonVisible: boolean
        viewMoreThanButtonVisible: boolean
        removeInfoListButtonVisible: boolean
    }>({
        contentModalData: [],
        contentModalVisible: false,
        viewAllButtonVisible: false,
        viewMoreThanButtonVisible: false,
        removeInfoListButtonVisible: false
    })

    public pushProfileInfo(profile: IProfileItem) {
        this.list.value.push(profile)
    }

    public pushResultsByUrl(url: string, items: IReviewsItem[]) {
        const profileByUrl = this.list.value.find(item => item.url === url)

        if (profileByUrl) {
            profileByUrl.reviewsList = items
            this.sortResults(profileByUrl, 'product_name_asc')
        }
    }

    public sortResults(profile: IProfileItem, sortBy: TypeReviewsSortBy) {
        if (profile.reviewsList) {
            profile.reviewsSortedBy = sortBy

            if (sortBy === 'product_name_asc') {
                profile.reviewsList.sort((a, b) => a.productName.localeCompare(b.productName))
            }

            if (sortBy === 'product_name_desc') {
                profile.reviewsList.sort((a, b) => b.productName.localeCompare(a.productName))
            }
        
            if (sortBy === 'rating_desc') {
                profile.reviewsList.sort((a, b) => b.rating - a.rating)
            }

            if (sortBy === 'rating_asc') {
                profile.reviewsList.sort((a, b) => a.rating - b.rating)
            }
        
            if (sortBy === 'date_desc') {
                profile.reviewsList.sort((a, b) => b.date - a.date)
            }

            if (sortBy === 'date_asc') {
                profile.reviewsList.sort((a, b) => a.date - b.date)
            }
        }
    }

    public copyItemInfo(profile: IProfileItem) {
        let textValue: string = ''

        textValue+= `${profile.name}\n`
        textValue+= `${profile.url}\n`
        textValue+= `${profile.rating}\n`
        textValue+= `${profile.reviewsCount}\n`
        textValue+= `${profile.subscribers}\n`
        textValue+= `${profile.deliveryInfo}\n`
        textValue+= `${toLocaleString(profile.parsingDate)}\n\n\n\n`

        this.sortResults(profile, 'product_name_asc')

        profile.reviewsList?.forEach(resultItem => {
            let date = new Date(resultItem.date)
            let formatDate = new Intl.DateTimeFormat('ru', {month: '2-digit', year: 'numeric' }).format(date)
            textValue += `${resultItem.productName}~${formatDate}${resultItem.delivery ? '~Delivery' : ''}\n`
        })

        if (textValue) {
            copyToBuffer(textValue)
            toast.show('success', MessagesEnum.InfoCopied)
        }
    }

    public getMoreThanResults(moreThan: number = 5): TypeResultExtended[] {
        let resultsList: TypeResultExtended[] = []
        let resultMap : Map<string, TypeResultExtended[]> = new Map()
        
        this.list.value.forEach(profile => {
            profile.reviewsList?.forEach(resultItem => {
                if (resultMap.has(resultItem.productName)) {
                    let mapValue = resultMap.get(resultItem.productName)
                    if (mapValue) {
                        let newMapValue: TypeResultExtended[] = [...mapValue, {
                            ...resultItem,
                            color: profile.color,
                            info: `${profile.name} / ${profile.rating} / ${profile.reviewsCount} / ${profile.subscribers} / ${profile.deliveryInfo}`
                        }]
                        resultMap.set(resultItem.productName, newMapValue)
                    }
                } else {
                    resultMap.set(resultItem.productName, [
                        {
                            ...resultItem,
                            color: profile.color,
                            info: `${profile.name} / ${profile.rating} / ${profile.reviewsCount} / ${profile.subscribers} / ${profile.deliveryInfo}`
                        }
                    ])
                }
            });
        })

        resultMap.forEach((mapItem, key) => {
            if (mapItem.length >= moreThan) {
                if (mapItem[0]) {
                    mapItem[0].count = mapItem.length
                } 
                resultsList.push(mapItem[0])
            }
        })

        resultMap.clear()

        return resultsList
    }

    public getAllResults(): TypeResultExtended[] {
        let resultsList: TypeResultExtended[] = []

        this.list.value.forEach(profile => {
            profile.reviewsList?.forEach((resultItem) => {
                resultsList.push({
                    ...resultItem,
                    color: profile.color,
                    info: `${profile.name} / ${profile.rating} / ${profile.reviewsCount} / ${profile.subscribers} / ${profile.deliveryInfo}`
                })
            })
        })

        resultsList.sort((a, b) => a.productName.localeCompare(b.productName))

        return resultsList
    }

    public async apiProfileCheckInDB(profile: IProfileItem) {
        let rows = await DB.savedProfiles.where("url").equals(profile.url).toArray()

        if (rows.length && rows[0]) {
            let foundProfile = rows[0]

            profile.id = foundProfile.id
            profile.savedDate = foundProfile.savedDate
            profile.comment = foundProfile.comment
            profile.existsInDataBase = true
        }
    
        return null
    }

    public async apiCreateInfoList() {
        try {

            let itemsToDB = JSON.parse(JSON.stringify(this.list.value))

            if (itemsToDB.length) {
                DB.profileInfoList.clear()
                DB.profileInfoList.bulkAdd(itemsToDB)
                toast.show('success', MessagesEnum.ProfileInfoListAddedInDB)
            }

        } catch (error: any) {
            console.log(error);
        } finally {

        }
    }

    public async apiGetInfoList(): Promise<IProfileItem[]> {
        try {

            const rows = await DB.profileInfoList.toArray()

            if (rows.length) {
                return rows
            }

        } catch (error: any) {
            console.log(error);
        } finally {

        }

        return []
    }

    public async apiRemoveInfoList(): Promise<void> {
        try {

            await DB.profileInfoList.clear()
            toast.show('success', MessagesEnum.ProfileInfoListRemovedFromDB)

        } catch (error: any) {
            console.log(error);
        } finally {

        }
    }

    public async apiRemoveInfoListOnlyUnmarked(): Promise<void> {
        try {

            let rows = await DB.profileInfoList.filter((profile: IProfileItem) => profile.marked === false).toArray()
            let ids = rows.map((profile: IProfileItem) => profile.id)
            await DB.profileInfoList.bulkDelete(ids)
            toast.show('warning', MessagesEnum.ProfileInfoListRemovedFromDB)

        } catch (error: any) {
            console.log(error);
        } finally {

        }
    }

    public async apiProfileCreate(profile: IProfileItem) {
        try {
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

            const resultID = await DB.savedProfiles.add(newProfile)

            profile.id = resultID
            profile.existsInDataBase = true
            profile.savedDate = newProfile.savedDate
            profile.comment = newProfile.comment

            toast.show('success', MessagesEnum.ProfileCreated)

        } catch(error: any) {
            console.log(error);
            toast.show('error', MessagesEnum.ProfileCreateError)
        } finally {
            
        }
    }
}

export const profileInfoList = new ProfileInfoList()