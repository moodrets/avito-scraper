import DB from "@/db/db";
import { IProfileLink, IReviewsFilter } from "@/reactive/useReviewsFilter";

export async function apiReviewsFilterSave(filterFields: IReviewsFilter) {

    const copyFilter = JSON.parse(JSON.stringify(filterFields))

    copyFilter.profilesLinks.forEach((link: IProfileLink) => link.status = 'new')

    const rows = await DB.reviewsFilter.where("key").equals('reviewsFilter').toArray()

    if (rows.length) {
        DB.reviewsFilter.update('reviewsFilter', {...copyFilter, key: 'reviewsFilter'})
    } else {
        DB.reviewsFilter.add({...copyFilter, key: 'reviewsFilter'})
    }
}

export async function apiReviewsFilterGet(): Promise<IReviewsFilter | null> {
    const rows = await DB.reviewsFilter.where('key').equals('reviewsFilter').toArray()

    if (rows.length && rows[0]) {
        const result = {...rows[0]}
        delete result.key
        return result
    }
    
    return null
}

export async function apiReviewsFilterRemove() {
    await DB.reviewsFilter.where('key').equals('reviewsFilter').delete()
}