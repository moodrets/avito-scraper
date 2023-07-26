import { reactive } from "vue"

export interface IReviewsItem {
    date: number
    dateText: string
    productName: string
    delivery: boolean
    rating: number
    profileUrl: string
}

export const parsedReviewsList = reactive<IReviewsItem[]>([])

export function getReviewsListByUrl(url: string): IReviewsItem[] {
    const reviewsByUrl = parsedReviewsList.filter(item => item.profileUrl === url)
    return reviewsByUrl.length ? reviewsByUrl : []
}