import Dexie from "dexie";

const DB: any = new Dexie('avito_scraper');

export function initDBCollections(version: number = 1){
    DB.version(version).stores({
        reviewsFilter: `
            key,
            productName, 
            dateFrom, 
            dateTo, 
            ratingFrom, 
            ratingTo, 
            scrollInterval, 
            deliveryOnly, 
            *profilesLinks
        `,
    });
}

export default DB