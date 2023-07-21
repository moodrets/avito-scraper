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

export interface IProfileItem {
    id?: number,
    existsInDataBase?: boolean,
    url: string,
    createdDate: number,
    createdDateFormatted: string,
    name: string,
    rating: string,
    reviewsCount: string,
    subscribers: string,
    deliveryInfo: string,
}

export interface IProfileItemExt extends IProfileItem {
    opened: boolean
}

export interface IReviewsItem {
    date: number | string,
    dateText: string,
    productName: string,
    delivery: boolean,
    rating: number | string
}