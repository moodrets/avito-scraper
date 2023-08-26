import Dexie from "dexie";

const DB: any = new Dexie('avito_scraper');

export function initDBCollections(version: number = 1) {
    DB.version(version).stores({
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