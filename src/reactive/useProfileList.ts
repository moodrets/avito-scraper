import { ref } from "vue";
import { IParsingResultItem } from "@/reactive//useParsingResults";
import { IReviewsItem, ReviewsSortBy } from "@/reactive/useReviewsItems";

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
    comment: string
    reviewsSortedBy: ReviewsSortBy
    id?: number
    existsInDataBase?: boolean
    savedDate?: number
    parsingResults?: IParsingResultItem[]
    reviewsList?: IReviewsItem[]
}

export interface IProfileItemDB {
    id?: number
    url: string
    name: string
    comment: string
    savedDate: number
    parsingResults: IParsingResultItem[]
}

export interface IProfileItemDBExt extends IProfileItemDB {
    opened: boolean,
    loading: boolean
}

export const profileInfoList = ref<IProfileItem[]>([])

export const profileSavedList = ref<IProfileItemDBExt[]>([])