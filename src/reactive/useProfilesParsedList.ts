import DB from '@/db/db'
import { reactive, ref } from 'vue'
import { IProfileItemDB } from '@/reactive/useProfileSavedList'
import { toast } from '@/helpers/toast'
import { MessagesEnum } from '@/types/enums'
import { toLocaleString } from '@/helpers/date'
import { copyToBuffer } from '@/helpers/common'
import { orderBy } from 'lodash'

export interface IReviewsItem {
    date: number
    dateText: string
    productName: string
    delivery: boolean
    rating: number
    profileUrl: string
}

export interface IReviewsItemExt extends IReviewsItem {
    color: {
        text: string,
        bg: string
    }, 
    info: string,
    count: number
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
    reviewsSortedBy: string
    color: {
        text: string,
        bg: string
    },
    id?: number
    existsInDataBase?: boolean
    savedDate?: number
    reviewsList?: IReviewsItem[]
}

class ProfilesParseList {
    public list = ref<IProfileItem[]>([])

    public state = reactive<{
        contentModalData: IReviewsItemExt[],
        contentModalVisible: boolean
        viewAllButtonVisible: boolean
        viewMoreThanButtonVisible: boolean
    }>({
        contentModalData: [],
        contentModalVisible: false,
        viewAllButtonVisible: false,
        viewMoreThanButtonVisible: false,
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

    public sortResults(profile: IProfileItem, sortBy: string) {
        if (!profile.reviewsList) return

        profile.reviewsSortedBy = sortBy
        let copyArray = JSON.parse(JSON.stringify(profile.reviewsList)) as IReviewsItem[]
        let resultArray: IReviewsItem[] = []

        if (sortBy === 'product_name_desc') {
            resultArray = orderBy(copyArray, ['productName'], ['desc'])
        }

        if (sortBy === 'product_name_asc') {
            resultArray = orderBy(copyArray, ['productName'], ['asc'])
        }
        
        if (sortBy === 'rating_desc') {
            resultArray = orderBy(copyArray, ['rating'], ['desc'])
        }

        if (sortBy === 'rating_asc') {
            resultArray = orderBy(copyArray, ['rating'], ['asc'])
        }
    
        if (sortBy === 'date_desc') {
            resultArray = orderBy(copyArray, ['date'], ['desc'])
        }

        if (sortBy === 'date_asc') {
            resultArray = orderBy(copyArray, ['date'], ['asc'])
        }

        if (sortBy === 'delivery_desc') {
            resultArray = orderBy(copyArray, ['delivery'], ['desc', 'asc'])
        }

        if (sortBy === 'delivery_asc') {
            resultArray = orderBy(copyArray, ['delivery'], ['asc', 'desc'])
        }

        profile.reviewsList = []

        profile.reviewsList = resultArray
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

    public getMoreThanResults(moreThan: number = 10): IReviewsItemExt[] {
        let resultsList: IReviewsItemExt[] = []
        let resultMap : Map<string, IReviewsItemExt[]> = new Map()
        
        this.list.value.forEach(profile => {
            profile.reviewsList?.forEach(resultItem => {
                let productNameLC = resultItem.productName.toLowerCase()
                if (resultMap.has(productNameLC)) {
                    let mapValue = resultMap.get(productNameLC)
                    if (mapValue) {
                        let newMapValue: IReviewsItemExt[] = [...mapValue, {
                            ...resultItem,
                            color: profile.color,
                            info: `${profile.name} / ${profile.rating} / ${profile.reviewsCount} / ${profile.subscribers} / ${profile.deliveryInfo}`,
                            count: 0,
                        }]
                        resultMap.set(productNameLC, newMapValue)
                    }
                } else {
                    resultMap.set(productNameLC, [
                        {
                            ...resultItem,
                            color: profile.color,
                            info: `${profile.name} / ${profile.rating} / ${profile.reviewsCount} / ${profile.subscribers} / ${profile.deliveryInfo}`,
                            count: 0,
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

        let copyArray = JSON.parse(JSON.stringify(resultsList)) as IReviewsItemExt[]
        copyArray.sort((a,b) => a.count > b.count ? -1 : a.count < b.count ? 1 : 0)

        resultsList = copyArray

        return resultsList
    }

    public getAllResults(): IReviewsItemExt[] {
        let resultsList: IReviewsItemExt[] = []

        this.list.value.forEach(profile => {
            profile.reviewsList?.forEach((resultItem) => {
                resultsList.push({
                    ...resultItem,
                    color: profile.color,
                    info: `${profile.name} / ${profile.rating} / ${profile.reviewsCount} / ${profile.subscribers} / ${profile.deliveryInfo}`,
                    count: 0,
                })
            })
        })

        let copyArray = JSON.parse(JSON.stringify(resultsList)) as IReviewsItemExt[]
        copyArray.sort((a, b) => a.productName.localeCompare(b.productName))

        resultsList = copyArray

        return resultsList
    }

    public async apiRemoveProfile(id: number) {
        try {

            if (id) {
                let { profilesParsedList } = await chrome.storage.local.get('profilesParsedList')

                if (profilesParsedList.length) {
                    profilesParsedList = profilesParsedList.filter((storageItem: IProfileItem) => storageItem.id !== id)
                    await chrome.storage.local.set({'profilesParsedList': profilesParsedList})
                }
            }

        } catch(error: any) {
            console.log(error);
        } finally {

        }
    }

    public async apiUpdateProfile(profile: IProfileItem) {
        try {

            if (profile.id) {
                let { profilesParsedList } = await chrome.storage.local.get('profilesParsedList')
                let copyProfile = JSON.parse(JSON.stringify(profile))
                let findIndex = profilesParsedList.findIndex((findProfile: IProfileItem) => findProfile.id === copyProfile.id)

                if (findIndex !== undefined && findIndex !== null) {
                    profilesParsedList[findIndex] = copyProfile
                    await chrome.storage.local.set({'profilesParsedList': profilesParsedList})
                }
            }
            
        } catch(error: any) {
            console.log(error);
        }
    }

    public async apiCreateList() {
        try {

            let copyArray = JSON.parse(JSON.stringify(this.list.value))

            if (copyArray.length) {
                await chrome.storage.local.set({'profilesParsedList': copyArray})
            }

        } catch (error: any) {
            console.log(error);
        } finally {

        }
    }

    public async apiGetList(): Promise<IProfileItem[]> {
        try {

            const { profilesParsedList } = await chrome.storage.local.get('profilesParsedList')

            if (profilesParsedList) {
                return profilesParsedList
            }

        } catch (error: any) {
            console.log(error);
        } finally {

        }

        return []
    }

    public async apiRemoveList(): Promise<void> {
        try {

            await chrome.storage.local.remove('profilesParsedList')

        } catch (error: any) {
            console.log(error);
        } finally {

        }
    }

    public async apiRemoveListUnmarkedOnly(): Promise<void> {
        try {

            let { profilesParsedList } = await chrome.storage.local.get('profilesParsedList')

            if (profilesParsedList) {
                profilesParsedList = profilesParsedList.filter((item: IProfileItem) => item.marked)
                await chrome.storage.local.set({'profilesParsedList': profilesParsedList})
            }

        } catch (error: any) {
            console.log(error);
        } finally {

        }
    }
}

export const profilesParsedList = new ProfilesParseList()