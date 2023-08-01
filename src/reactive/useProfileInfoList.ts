import DB from '@/db/db'
import { reactive, ref } from 'vue'
import { IProfileItemDB } from './useProfileSavedList'
import { toast } from '@/helpers/toast'
import { MessagesEnum } from '@/types/enums'
import { toLocaleString } from '@/helpers/date'
import { copyToBuffer } from '@/helpers/common'

export type ReviewsSortBy = 'rating' | 'productName' | 'date'

type TypeResultExtended = IReviewsItem & {color: string, info: string}

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

    public state = reactive<{
        contentModalText: string
        contentModalVisible: boolean
        viewAllButtonVisible: boolean
        viewMoreThanButtonVisible: boolean
    }>({
        contentModalText: '',
        contentModalVisible: false,
        viewAllButtonVisible: false,
        viewMoreThanButtonVisible: false
    })

    public pushProfileInfo(profile: IProfileItem) {
        this.list.value.push(profile)
    }

    public pushResultsByUrl(url: string, items: IReviewsItem[]) {
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
        textValue+= `${profile.deliveryInfo}\n`
        textValue+= `${toLocaleString(profile.parsingDate)}\n\n\n\n`

        this.sortResults(profile, 'productName')

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
    
    private makeStringFromResults(resultsList: TypeResultExtended[], withTag: boolean = true) {
        let textValue: string = ''

        resultsList.forEach(resultItem => {
            let date = new Date(resultItem.date)
            let formatDate = new Intl.DateTimeFormat('ru', {month: '2-digit', year: 'numeric' }).format(date)

            if (withTag) {
                textValue+=`
                    <div class="py-1 px-2 text-[14px] leading-[14px] font-medium border-b border-gray-600 mr-2 text-black" style="background-color: ${resultItem.color}" title='${resultItem.info}'>
                        ${resultItem.productName}~${formatDate}${resultItem.delivery ? '~Delivery' : ''}
                    </div>
                `
            } else {
                textValue+=`${resultItem.productName}~${formatDate}${resultItem.delivery ? '~Delivery' : ''}`
            }
        })

        return textValue
    }

    public getMoreThanContent(moreThan: number = 5): string {
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
                resultsList.push(mapItem[0])
            }
        })

        let resultText = this.makeStringFromResults(resultsList)

        resultMap.clear()
        resultsList = []

        return resultText || `<div class="text-xl text-center font-bold">${MessagesEnum.ResultsNotFound}</div>`
    }

    public getViewAllContent(): string {
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

        let resultText = this.makeStringFromResults(resultsList)

        resultsList = []

        return resultText || `<div class="text-xl text-center font-bold">${MessagesEnum.ResultsNotFound}</div>`
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

            toast.show('success', MessagesEnum.ProfileCreated)

        } catch(error: any) {
            console.log(error);
            toast.show('error', MessagesEnum.ProfileCreateError)
        } finally {
            
        }
    }
}

export const profileInfoList = new ProfileInfoList()