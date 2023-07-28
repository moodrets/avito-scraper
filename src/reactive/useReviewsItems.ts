import { reactive } from "vue"

export interface IReviewsItem {
    date: number
    dateText: string
    productName: string
    delivery: boolean
    rating: number
    profileUrl: string
}

export type ReviewsSortBy = 'rating' | 'productName' | 'date'

export const parsedReviewsList = reactive<IReviewsItem[]>([])

export function getReviewsListByUrl(url: string, sortBy: ReviewsSortBy = 'productName'): IReviewsItem[] {
    const reviewsListByUrl = parsedReviewsList.filter(item => item.profileUrl === url)

    if (sortBy === 'productName') {
        reviewsListByUrl.sort((a, b) => a.productName.localeCompare(b.productName))
    }

    if (sortBy === 'rating') {
        reviewsListByUrl.sort((a, b) => b.rating - a.rating)
    }

    if (sortBy === 'date') {
    }

    return reviewsListByUrl.length ? reviewsListByUrl : []
}