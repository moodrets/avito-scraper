import { ref } from "vue";
import { IParsingResultItem } from "@/reactive//useParsingResults";
import { IReviewsItem } from "@/reactive/useReviewsItems";

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
    comment: string,
    id?: number
    existsInDataBase?: boolean
    savedDate?: number
    paringResults?: IParsingResultItem[]
    reviewsList?: IReviewsItem[],
}

export const profileInfoList = ref<IProfileItem[]>([])

export const profileSavedList = ref<IProfileItem[]>([])

export async function findProfileInDB(profileItem: IProfileItem | IProfileItem): Promise<IProfileItem | null> {
    let foundProfile

    if (profileItem) {
        foundProfile = await apiProfileGetByUrl(profileItem.url)
    }
    return foundProfile || null
}

export function profileInfoListPushData(profile: IProfileItem) {
    const profileExt: IProfileItem = {
        ...profile,
        opened: false,
        loading: false
    }
    profileInfoList.value.push(profileExt)
}

export async function apiProfileGetList(urlParams?: string): Promise<IProfileItem[]> {
    let { profileList } = await chrome.storage.local.get('profileList')
    return profileList ? profileList : []
}

export async function apiProfileGetByUrl(url: string): Promise<IProfileItem | null> {
    let foundProfile: IProfileItem | null = null

    const { profileList } = await chrome.storage.local.get('profileList')

    if (profileList) {
        let result = profileList.find((item: any) => item.url === url)

        if (result) {
            foundProfile = result
        }
    }

    return foundProfile
}

export async function apiProfileCreate(profile: IProfileItem): Promise<IProfileItem> {
    let profileListToStorage: IProfileItem[] = []
    let profileToStorage: IProfileItem = {...profile}

    profileToStorage.id = Date.now()
    profileToStorage.savedDate = Date.now()

    const { profileList } = await chrome.storage.local.get('profileList')

    if (profileList) {
        profileListToStorage = [...profileList]
    }

    profileListToStorage.unshift(profileToStorage)

    await chrome.storage.local.set({'profileList' : profileListToStorage})

    return profileToStorage
}

export async function apiProfileRemove(id: number): Promise<void> {
    let { profileList } = await chrome.storage.local.get('profileList')

    if (profileList) {

        profileList = profileList.filter((item: any) => item.id !== id)

        await chrome.storage.local.set({'profileList': profileList})
    }
}