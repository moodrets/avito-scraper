import { IProfileItem } from "@/types/infterfaces"

export async function apiGetProfileList(urlParams?: string): Promise<IProfileItem[]> {
    let { profileList } = await chrome.storage.local.get('profileList')
    return profileList ? profileList : []
}

export async function apiGetProfileByUrl(url: string): Promise<IProfileItem | null> {
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

export async function apiCreateProfile(profile: IProfileItem): Promise<IProfileItem> {
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

export async function apiRemoveProfile(id: number): Promise<void> {
    let { profileList } = await chrome.storage.local.get('profileList')

    if (profileList) {

        profileList = profileList.filter((item: any) => item.id !== id)

        await chrome.storage.local.set({'profileList': profileList})
    }
}