import DB from '@/db/db'
import { ref } from 'vue'
import { IProfileItemDB } from './useProfileSavedList'
import { toast } from '@/helpers/toast'
import { MessagesEnum } from '@/types/enums'
import { toLocaleString } from '@/helpers/date'
import { copyToBuffer } from '@/helpers/common'

export type ReviewsSortBy = 'rating' | 'productName' | 'date'

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
    comment: string
    reviewsSortedBy: ReviewsSortBy
    color: string
    id?: number
    existsInDataBase?: boolean
    savedDate?: number
    reviewsList?: IReviewsItem[]
}

class ProfileInfoList {
    public list = ref<IProfileItem[]>([])

    public pushProfileInfo(profile: IProfileItem) {
        this.list.value.push(profile)
    }

    public pushProductsByUrl(url: string, items: IReviewsItem[]) {
        const profileByUrl = this.list.value.find(item => item.url === url)

        if (profileByUrl) {
            profileByUrl.reviewsList = items
            this.sortResults(profileByUrl, 'productName')
        }
    }

    public sortResults(profile: IProfileItem, sortBy: ReviewsSortBy) {
        if (profile.reviewsList) {
            if (sortBy === 'productName') {
                profile.reviewsSortedBy = sortBy
                profile.reviewsList.sort((a, b) => a.productName.localeCompare(b.productName))
            }
        
            if (sortBy === 'rating') {
                profile.reviewsSortedBy = sortBy
                profile.reviewsList.sort((a, b) => b.rating - a.rating)
            }
        
            if (sortBy === 'date') {
                profile.reviewsSortedBy = sortBy
                profile.reviewsList.sort((a, b) => b.date - a.date)
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
        textValue+= `${profile.deliveryInfo}\n\n\n\n`
        textValue+= `${toLocaleString(profile.parsingDate)}\n`

        this.sortResults(profile, 'productName')

        profile.reviewsList?.forEach(item => {
            let date = new Date(item.date)
            // let day = new Intl.DateTimeFormat('ru', { day: '2-digit' }).format(date)
            let month = new Intl.DateTimeFormat('ru', { month: '2-digit' }).format(date)
            let year = new Intl.DateTimeFormat('ru', { year: 'numeric' }).format(date)
            textValue += `${item.productName}~${month}.${year}${item.delivery ? '~Delivery' : ''}\n`
        })

        if (textValue) {
            copyToBuffer(textValue)
            toast.show('success', MessagesEnum.InfoCopied)
        }
    }

    public copyAllInfo() {

    }

    public async apiCheckInDB(profile: IProfileItem) {
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
                        subscribers: copyProfile.subscribers
                    }
                ]
            }

            const resultID = await DB.savedProfiles.add(newProfile)

            profile.id = resultID
            profile.existsInDataBase = true
            profile.savedDate = newProfile.savedDate
            profile.comment = newProfile.comment

            toast.show('success', MessagesEnum.ProfileCreateError)

        } catch(error: any) {
            console.log(error);
            toast.show('error', MessagesEnum.ProfileCreateError)
        } finally {
            
        }
    }
}

export const profileInfoList = new ProfileInfoList()