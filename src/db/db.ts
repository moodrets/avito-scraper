import Dexie from "dexie";

const DB: any = new Dexie('avito_scraper');

export function initDBCollections(version: number = 1) {
    DB.version(version).stores({
        profilesParseFilter: `
            ++id,
            productName,
            dateFrom,
            dateTo,
            ratingFrom,
            ratingTo,
            scrollInterval,
            deliveryOnly,
            closeTabs,
            *profilesLinks
        `,
        profilesSearchFilter: `
            ++id,
            reviewsCount,
            categoryUrl,
            profileName,
            pageStart,
            pageEnd,
            pageTitle
        `,
        profilesSearchedList: `
            ++id,
            url,
            name,
            rating,
            reviewsCount,
            existsInDataBase
        `,
        profilesParsedList: `
            ++id,
            activeAdds,
            color,
            comment,
            completedAdds,
            deliveryInfo,
            marked,
            name,
            opened,
            parsingDate,
            rating,
            reviewsCount,
            reviewsSortedBy,
            subscribers,
            url,
            *reviewsList
        `,
        profilesSavedList: `
            ++id,
            &url,
            name,
            comment,
            savedDate,
            *parsingResults
        `
    });
}

export default DB