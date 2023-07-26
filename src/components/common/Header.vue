<template>
    <header class="mb-8 border-b border-gray-500 sticky top-0 z-[100] bg-gray-700">
        <div class="centered py-3 flex flex-wrap items-center gap-3">
            <Button 
                v-for="tab in tabsList"
                :key="tab.value" 
                :icon="tab.icon"
                :class="[
                    activeTab === tab.value ? 'ring-2 ring-white' : '',
                ]"
                @click="changeMainTab(tab.value)"
            >{{ tab.text }}</Button>
            <Button 
                theme="info" 
                type="button"
                icon="settings" 
                class="ml-auto"
                :class="[
                    activeTab === MainTabsEnum.Settings ? 'ring-2 ring-white' : '',
                ]"
                @click="changeMainTab(MainTabsEnum.Settings)"
            ></Button>
        </div>
        <div class="h-1.5 progress-loader transition-all" :class="{'opacity-0': !loading}"></div>
    </header>
</template>

<script lang="ts" setup>
import Button from '@/components/common/Button.vue'
import { loading } from '@/reactive/useAppLoader';
import { activeTab, changeMainTab } from '@/reactive/useMainTabs';
import { MainTabsEnum } from '@/types/enums';

const tabsList = [
    {
        value: MainTabsEnum.ReviewsFilter,
        text: 'Фильтр отзывов',
        icon: 'tune'
    },
    {
        value: MainTabsEnum.ProfileInfoList,
        text: 'Результаты парсинга',
        icon: 'view_list'
    },
    {
        value: MainTabsEnum.ProfileSavedList,
        text: 'База профилей',
        icon: 'people'
    },
]
</script>