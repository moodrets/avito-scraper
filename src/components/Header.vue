<template>
    <header class="p-3 mb-4 border-b border-gray-500 sticky top-0 z-[100]">
        <div class="flex flex-wrap items-center gap-2">
            <Button 
                class="border-2"
                v-for="tab in tabsList" 
                :key="tab.value" 
                :icon="tab.icon"
                :class="activeTab === tab.value ? 'border-white' : 'border-transparent'"
                @click="changeMainTab(tab.value)"
            >{{ tab.text }}</Button>
            <a target="_blank" href="options.html" class="button ml-auto">
                <i class="font-icon mr-2 text-xl">settings</i>
                <span>Настроки</span>
            </a>
            <a target="_blank" href="page.html">test page</a>
        </div>
    </header>
</template>

<script lang="ts" setup>
import Button from '@//components/Button.vue'
import { activeTab, changeMainTab } from '@/reactive/useMainTabs';

const tabsList = [
    {
        value: 'main',
        text: 'Главная',
        icon: 'home'
    },
    {
        value: 'logs',
        text: 'Логи',
        icon: 'line_weight'
    },
    {
        value: 'users_data_base',
        text: 'База пользователей',
        icon: 'supervisor_account'
    },
]
</script>