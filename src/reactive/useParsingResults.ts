import { IProfileItemExt } from "@/reactive/useProfileList"

export interface IParsingResultItem {
    profileId: number
    profileUrl: string
    parsingDate: number
    rating: string
    reviewsCount: string
    subscribers: string
    deliveryInfo: string
}

export async function apiParsingResultsCreate(profileItem: IProfileItemExt) {
    let listToStorage: IParsingResultItem[] = []

    const newParsingResult: IParsingResultItem = {
        parsingDate: profileItem.parsingDate,
        deliveryInfo: profileItem.deliveryInfo,
        profileId: profileItem.id || 0,
        profileUrl: profileItem.url,
        reviewsCount: profileItem.reviewsCount,
        subscribers: profileItem.subscribers,
        rating: profileItem.rating
    }

    const { parsingResults } = await chrome.storage.local.get('parsingResults')

    if (parsingResults) {
        listToStorage = [...parsingResults]
    }

    listToStorage.unshift(newParsingResult)

    await chrome.storage.local.set({'parsingResults' : listToStorage})
}

export async function apiParsingResultsGetListByUrl(url: string): Promise<IParsingResultItem[]> {
    let foundItems: IParsingResultItem[] = [] 

    const { parsingResults } = await chrome.storage.local.get('parsingResults')

    if (parsingResults) {
        foundItems = parsingResults.filter((item: IParsingResultItem) => item.profileUrl === url)
    }

    return foundItems
}

export async function apiParsingResultsRemoveByUrl(url: string): Promise<void> {
    let listToStorage: IParsingResultItem[] = [] 

    const { parsingResults } = await chrome.storage.local.get('parsingResults')

    if (parsingResults) {
        listToStorage = parsingResults.filter((item: IParsingResultItem) => item.profileUrl !== url)
    }

    await chrome.storage.local.set({'parsingResults' : listToStorage})
}