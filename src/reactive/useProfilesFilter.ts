import { reactive, ref } from 'vue'
import { createTab, findBrowserTabByURL, wait } from '@/helpers/common';
import { toast } from '@/helpers/toast';
import { MessagesEnum } from '@/types/enums';

export interface IProfileFilterCategories {
    [key: string]: {text: string, url: string}[]
}

export interface IProfileFilterFields {
    category: string,
    profileName: string,
    reviewsCount: number
}

class ProfilesFilter {
    public openedTab = ref<Record<string, any>>({})

    public state = reactive<{
        currentPage: number,
        categoriesLoading: boolean,
        categories: IProfileFilterCategories,
    }>({
        currentPage: 0,
        categoriesLoading: false,
        categories: {},
    })

    public fields = reactive<IProfileFilterFields>({
        reviewsCount: 100,
        category: '',
        profileName: ''
    })

    public async getCategories() {
        const currentTab = await createTab('https://www.avito.ru/')
        this.openedTab.value = currentTab

        if (currentTab.id) {
            chrome.tabs.sendMessage(currentTab.id, {
                action: 'get-categories',
            })
        }
    }

    public async setCategoryPageFilter() {
        const currentTab = await createTab(this.fields.category)
        this.openedTab.value = currentTab

        if (currentTab.id) {
            chrome.tabs.sendMessage(currentTab.id, {
                action: 'profiles-search-set-filter',
                currentUrl: this.fields.category,
                profilesFilterFields: JSON.parse(JSON.stringify(this.fields))
            })
        }
    }

    public async parsingStart() {
        await wait(3000)
        const categoryTab = await findBrowserTabByURL(this.fields.category)

        if (categoryTab && categoryTab.url) {
            let tabUrl = new URL(categoryTab.url)
            if (!Array.from(tabUrl.searchParams).length) {
                this.parsingStart()
                return
            }
        }

        if (categoryTab?.id) {
            chrome.tabs.sendMessage(categoryTab.id, {
                action: 'profiles-search-parsing-start',
                currentUrl: categoryTab.url,
                profilesFilterFields: JSON.parse(JSON.stringify(this.fields))
            })
            toast.show('success', MessagesEnum.ProfilesSearchStarted)
        }
    }

    public async apiCreateCategories() {
        try {
            const copyCategories = JSON.parse(JSON.stringify(this.state.categories))
            await chrome.storage.local.set({categories: copyCategories})
            toast.show('success', MessagesEnum.CategoriesSaved)
        } catch(error: any) {
            console.log(error);
        } finally {

        }
    }

    public async apiGetCategories() {
        const result = await chrome.storage.local.get('categories')
        return result.categories || {} 
    }
}

export const profilesFilter = new ProfilesFilter()