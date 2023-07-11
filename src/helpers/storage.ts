export const storageSet = async (key: string, data: any) => {
    return await chrome.storage.local.set({ [key]: data })
}

export const storageGet = async (key: string | string[] | null) => {
    return await chrome.storage.local.get(key)
}

export const storageRemove = async (key: string | string[]) => {
    return await chrome.storage.local.remove(key);
}