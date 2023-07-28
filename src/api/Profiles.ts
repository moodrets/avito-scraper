import DB from "@/db/db";
import { IProfileItem, IProfileItemDB, IProfileItemDBExt } from "@/reactive/useProfileList";

export async function apiProfileGetList(offset: number, limit: number): Promise<IProfileItemDB[]> {
    let rows: IProfileItemDB[] = []

    if (offset === 0 && limit === 0) {
        const result = await DB.savedProfiles.toArray()
        if (result.length) {
            rows = result
        }
    }

    return rows
}

export async function apiProfileCreate(profile: IProfileItem): Promise<IProfileItemDB | null> {
    let copyProfile = JSON.parse(JSON.stringify(profile))

    let savedProfile: IProfileItemDB | null = null

    let newProfile: IProfileItemDB = {
        url: copyProfile.url,
        name: copyProfile.name,
        comment: copyProfile.comment,
        savedDate: Date.now(),
        parsingResults: [
            {
                parsingDate: copyProfile.parsingDate,
                rating: copyProfile.rating,
                reviewsCount: copyProfile.reviewsCount,
                deliveryInfo: copyProfile.deliveryInfo,
                subscribers: copyProfile.subscribers
            }
        ]
    }

    let resultId = await DB.savedProfiles.add(newProfile)

    if (resultId) {
        let rows = await DB.savedProfiles.where(":id").equals(resultId).toArray()

        if (rows.length && rows[0]) {
            savedProfile = rows[0]
        }
    }

    return savedProfile ? savedProfile : null 
}

export async function apiProfileGetByUrl(url: string): Promise<IProfileItemDB | null> {
    let rows = await DB.savedProfiles.where("url").equals(url).toArray()

    if (rows.length && rows[0]) {
        return rows[0]
    }

    return null
}

export async function apiProfilePushParsingResult(profile: IProfileItem): Promise<boolean> {
    let copyProfile = JSON.parse(JSON.stringify(profile))
    let rows = await DB.savedProfiles.where("url").equals(copyProfile.url).toArray()

    if (rows.length && rows[0]) {
        let resultProfile: IProfileItemDB = rows[0]

        resultProfile.parsingResults.unshift({
            parsingDate: copyProfile.parsingDate,
            rating: copyProfile.rating,
            reviewsCount: copyProfile.reviewsCount,
            deliveryInfo: copyProfile.deliveryInfo,
            subscribers: copyProfile.subscribers
        })

        const result = await DB.savedProfiles.put(resultProfile)

        if (result) {
            return true
        }
    }

    return false
}

export async function apiProfileUpdate(id: number, profile: IProfileItemDB | IProfileItemDBExt): Promise<boolean> {
    let copyProfile = JSON.parse(JSON.stringify(profile))

    delete copyProfile.opened
    delete copyProfile.loading

    const result = await DB.savedProfiles.put(copyProfile);

    return result ? true : false
}

export async function apiProfileDelete(id: number) {
    await DB.savedProfiles.delete(id);
}