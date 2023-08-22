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
                    v-if="profileInfoList.state.viewAllButtonVisible && profileInfoList.list.value.length > 1"
                    theme="success" 
                    type="button"
                    icon="remove_red_eye"
                    @click.stop.prevent="onViewAll"
                >Все результаты</Button>
                <Button
                    v-if="profileInfoList.state.viewMoreThanButtonVisible && profileInfoList.list.value.length > 1"
                    theme="success" 
                    type="button"
                    icon="remove_red_eye"
                    @click.stop.prevent="onViewMoreThan"
                > >= 10</Button>
                <Button
                    v-if="profileInfoList.state.removeInfoListButtonVisible && profileInfoList.list.value.length"
                    theme="danger" 
                    type="button"
                    icon="delete_sweep"
                    @click.stop.prevent="onRemoveProfileInfoList"
                ></Button>
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
import { profileInfoList } from '@/reactive/useProfileInfoList';

async function onViewAll() {
    profileInfoList.state.contentModalVisible = true
    profileInfoList.state.contentModalData = profileInfoList.getAllResults()
}

async function onViewMoreThan() {
    profileInfoList.state.contentModalVisible = true
    profileInfoList.state.contentModalData = profileInfoList.getMoreThanResults()
}

async function onRemoveProfileInfoList() {
    if (window.confirm('Удаляем список профилей ?')) {
        profileInfoList.list.value = []
        profileInfoList.apiRemoveInfoList()
    }
}
</script>