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
                    loading ? 'pointer-events-none opacity-70' : ''  
                ]"
                @click="changeMainTab(tab.value)"
            >{{ tab.text }}</Button>
        </div>
        <div class="h-1.5 progress-loader transition-all" :class="{'opacity-0': !loading}"></div>
    </header>
</template>

<script lang="ts" setup>
import Button from '@/components/common/Button.vue'
import { loading } from '@/reactive/useAppLoader';
import { activeTab, changeMainTab } from '@/reactive/useMainTabs';

const tabsList = [
    {
        value: 'filter',
        text: 'Фильтр отзывов',
        icon: 'tune'
    },
    {
        value: 'parsing_result',
        text: 'Результаты парсинга',
        icon: 'view_list'
    },
    {
        value: 'profile_list',
        text: 'База профилей',
        icon: 'supervisor_account'
    },
]
</script>