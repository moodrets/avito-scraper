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
    scrollInterval: number
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
    scrollInterval: 2,
    deliveryOnly: false,
})

export function reviewsFilterFindNewProfileLink(): IProfileLink | null {
    const foundLink = reviewsFilterFields.profilesLinks.find((item) => item.status === 'new')
    return foundLink || null
}

export function reviewsFilterFindProfileLinkByUrl(url: string | undefined): IProfileLink | null {
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