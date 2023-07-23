import { IParsingResultItem, IProfileItem } from "@/types/interfaces";

export async function apiCreateParsingResult(profileItem: IProfileItem) {
    let listToStorage: IParsingResultItem[] = []

    const newParsingResult: IParsingResultItem = {
        parsingDate: profileItem.parsingDate,
        deliveryInfo: profileItem.deliveryInfo,
        profile_id: profileItem.id || 0,
        profile_url: profileItem.url,
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

export async function apiGetParsingItemsByUrl(url: string): Promise<IParsingResultItem[]> {
    let foundItems: IParsingResultItem[] = [] 

    const { parsingResults } = await chrome.storage.local.get('parsingResults')

    if (parsingResults) {
        foundItems = parsingResults.filter((item: IParsingResultItem) => item.profile_url === url)
    }

    return foundItems
}

export async function apiRemoveParsingItemsByUrl(url: string): Promise<void> {
    let listToStorage: IParsingResultItem[] = [] 

    const { parsingResults } = await chrome.storage.local.get('parsingResults')

    if (parsingResults) {
        listToStorage = parsingResults.filter((item: IParsingResultItem) => item.profile_url !== url)
    }

    await chrome.storage.local.set({'parsingResults' : listToStorage})
}