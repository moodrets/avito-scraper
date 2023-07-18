<template>
    <header class="mb-4 border-b border-gray-500 sticky top-0 z-[100] bg-gray-700">
        <div class="centered py-3 flex flex-wrap items-center gap-2">
            <Button 
                v-for="tab in tabsList" 
                class="border-2"
                :key="tab.value" 
                :icon="tab.icon"
                :theme="tab.theme as any || 'info'"
                :class="[
                    activeTab === tab.value ? 'border-white' : 'border-transparent',
                    loading ? 'pointer-events-none opacity-70' : ''  
                ]"
                @click="changeMainTab(tab.value)"
            >{{ tab.text }}</Button>
        </div>
        <div v-if="loading" class="h-1.5 progress-loader"></div>
        <div v-else class="h-1.5"></div>
    </header>
</template>

<script lang="ts" setup>
import Button from '@//components/Button.vue'
import { loading } from '@/reactive/useAppLoader';
import { activeTab, changeMainTab } from '@/reactive/useMainTabs';

const tabsList = [
    {
        value: 'filter',
        text: 'Фильтр отзывов',
        icon: 'tune'
    },
    {
        value: 'parse_result',
        text: 'Результаты поиска',
        icon: 'view_list'
    },
    {
        value: 'users_data_base',
        text: 'База профилей',
        icon: 'supervisor_account'
    },
    {
        value: 'reference',
        text: 'Справка',
        icon: 'info_outline',
        theme: 'warning'
    },
]
</script>