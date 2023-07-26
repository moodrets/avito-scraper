import { reactive } from "vue";

export interface IProfileLink {
    status: 'success' | 'error' | 'wait' | 'new',
    url: string
}

export interface IReviewsFilter {
    profilesLinks: IProfileLink[]
    productName: string
    dateFrom: string
    dateTo: string
    ratingFrom: number
    ratingTo: number
    interval: number
    deliveryOnly: false
}

export const reviewsFilterFields = reactive<IReviewsFilter>({
    profilesLinks: [
        {url: '', status: 'new'},
    ],
    productName: '',
    dateFrom: '',
    dateTo: '',
    ratingFrom: 4,
    ratingTo: 5,
    interval: 2,
    deliveryOnly: false,
})

export function reviewsFilterFindNewLink(): IProfileLink | null {
    const foundLink = reviewsFilterFields.profilesLinks.find((item) => item.status === 'new')
    return foundLink || null
}

export function reviewsFilterFindLinkByUrl(url: string | undefined): IProfileLink | null {
    if (!url) return null
    const foundLink = reviewsFilterFields.profilesLinks.find((item) => item.url === url)
    return foundLink || null
}

export function reviewsFilterAddProfileLink() {
    reviewsFilterFields.profilesLinks.push({
        status: 'new',
        url: ''
    })
}

export function reviewsFilterRemoveProfileLink(index: number) {
    reviewsFilterFields.profilesLinks.splice(index, 1)
}

export async function apiReviewsCreateFilter(reviewsFilter: IReviewsFilter): Promise<void> {
    await chrome.storage.local.set({ reviewsFilter })
}

export async function apiReviewsGetFilter(): Promise<IReviewsFilter | null> {
    const { reviewsFilter } = await chrome.storage.local.get('reviewsFilter')
    return reviewsFilter ? reviewsFilter : null
}

export async function apiReviewsRemoveFilter(): Promise<void> {
    await chrome.storage.local.remove('reviewsFilter')
}