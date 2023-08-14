import DB from '@/db/db';
import { createTab } from '@/helpers/common';
import { toast } from '@/helpers/toast';
import { MessagesEnum } from '@/types/enums';
import { reactive, ref } from 'vue'

export interface IProfileFilterCategories {
    [key: string]: {text: string, url: string}[]
}

export interface IProfileFilterFields {
    category: string
}

class ProfilesFilter {
    public openedTab = ref<Record<string, any>>({})

    public state = reactive<{
        categoriesLoading: boolean,
        categories: IProfileFilterCategories,
    }>({
        categoriesLoading: false,
        categories: {},
    })

    public fields = reactive<IProfileFilterFields>({
        category: ''
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