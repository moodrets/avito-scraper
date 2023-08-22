<template>
    <header class="mb-8 border-b border-gray-500 sticky top-0 z-[100] bg-gray-700">
        <div class="centered py-3 flex flex-wrap items-center gap-3">
            <Button 
                v-for="tab in appTabs.list"
                :key="tab.value" 
                :icon="tab.icon"
                :class="[
                    appTabs.active.value === tab.value ? 'ring-2 ring-white' : '',
                ]"
                @click="appTabs.changeTab(tab.value)"
            >{{ tab.text }}</Button>

            <div class="flex items-center gap-3 ml-auto">
                <Button
                    v-if="profilesParsedList.state.viewAllButtonVisible && profilesParsedList.list.value.length > 1"
                    theme="success" 
                    type="button"
                    icon="remove_red_eye"
                    @click.stop.prevent="onViewAll"
                >Все результаты</Button>
                <Button
                    v-if="profilesParsedList.state.viewMoreThanButtonVisible && profilesParsedList.list.value.length > 1"
                    theme="success" 
                    type="button"
                    icon="remove_red_eye"
                    @click.stop.prevent="onViewMoreThan"
                > >= 10</Button>
            </div>

            <Button 
                theme="info" 
                type="button"
                icon="settings" 
                class="ml-auto"
                :class="[
                    appTabs.active.value === AppTabsEnum.Settings ? 'ring-2 ring-white' : '',
                ]"
                @click="appTabs.changeTab(AppTabsEnum.Settings)"
            ></Button>
        </div>
    </header>
</template>

<script lang="ts" setup>
import Button from '@/components/common/Button.vue'
import { AppTabsEnum, appTabs } from '@/reactive/useAppTabs';
import { profilesParsedList } from '@/reactive/useProfilesParsedList';

async function onViewAll() {
    profilesParsedList.state.contentModalVisible = true
    profilesParsedList.state.contentModalData = profilesParsedList.getAllResults()
}

async function onViewMoreThan() {
    profilesParsedList.state.contentModalVisible = true
    profilesParsedList.state.contentModalData = profilesParsedList.getMoreThanResults()
}
</script>