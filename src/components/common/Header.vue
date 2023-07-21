<template>
    <header class="mb-8 border-b border-gray-500 sticky top-0 z-[100] bg-gray-700">
        <div class="centered py-3 flex flex-wrap items-center gap-2">
            <Button 
                v-for="tab in tabsList" 
                class="border-2"
                :key="tab.value" 
                :icon="tab.icon"
                :class="[
                    activeTab === tab.value ? 'border-white' : 'border-transparent',
                ]"
                @click="changeMainTab(tab.value)"
            >{{ tab.text }}</Button>
            <Button 
                theme="danger" 
                type="button" 
                icon="remove_circle" 
                class="ml-auto"
                @click.prevent="onClear"
            >Очистить хранилище</Button>
        </div>
        <div class="h-1.5 progress-loader transition-all" :class="{'opacity-0': !loading}"></div>
    </header>
</template>

<script lang="ts" setup>
import Button from '@/components/common/Button.vue'
import { loading } from '@/reactive/useAppLoader';
import { activeTab, changeMainTab } from '@/reactive/useMainTabs';
import { profileInfo } from '@/reactive/useProfileInfo';
import { MainTabsEnum } from '@/types/enums';

const tabsList = [
    {
        value: MainTabsEnum.Filter,
        text: 'Фильтр отзывов',
        icon: 'tune'
    },
    {
        value: MainTabsEnum.ReviewsResult,
        text: 'Результаты парсинга',
        icon: 'view_list'
    },
    {
        value: MainTabsEnum.ProfileList,
        text: 'База профилей',
        icon: 'people'
    },
]

async function onClear() {
    if (window.confirm('Мы сносим пользователей и результаты парсинга ?')) {
        await chrome.storage.local.remove(['profileList', 'parsingResults'])
        profileInfo.value && (profileInfo.value.existsInDataBase = false)
        window.location.reload()
    }
}
</script>