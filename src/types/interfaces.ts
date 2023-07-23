export interface IFilterFields {
    profileLink: string
    productName: string
    dateFrom: string
    dateTo: string
    ratingFrom: number
    ratingTo: number
    interval: number
    deliveryOnly: false
}

export interface IParsingResultItem {
    profile_id: number
    profile_url: string
    parsingDate: number
    rating: string
    reviewsCount: string
    subscribers: string
    deliveryInfo: string
}

export interface IProfileItem {
    id?: number
    existsInDataBase?: boolean
    savedDate?: number
    parsingDate: number
    url: string
    name: string
    rating: string
    reviewsCount: string
    subscribers: string
    deliveryInfo: string
}

export interface IProfileItemExt extends IProfileItem {
    paringResults?: IParsingResultItem[]
    loading: boolean,
    opened: boolean
}

export interface IReviewsItem {
    date: number
    dateText: string
    productName: string
    delivery: boolean
    rating: number
}