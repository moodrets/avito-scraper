import { IFilterFields } from "@/types/infterfaces";

export async function apiCreateFilter(filterFields: IFilterFields): Promise<void> {
    await chrome.storage.local.set({ filterFields })
}

export async function apiGetFilter(): Promise<IFilterFields | null> {
    const { filterFields } = await chrome.storage.local.get('filterFields')
    return filterFields ? filterFields : null
}

export async function apiRemoveFilter(): Promise<void> {
    await chrome.storage.local.remove('filterFields')
}