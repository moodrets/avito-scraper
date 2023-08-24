<template>
    <div class="relative p-5 shadow-xl rounded-xl mb-5 bg-gray-600">
        <div class="text-2xl font-bold mb-6">Модули</div>
        <div class="flex flex-wrap items-center gap-5">
            <Button theme="info" icon="save" @click.stop="onSaveModulesData">Сохранить данные</Button>
            <Button theme="danger" icon="restore" @click.stop="onDropModulesData">Сбросить данные</Button>
        </div>
    </div>
    <div class="relative p-5 shadow-xl rounded-xl mb-5 bg-gray-600">
        <Spinner v-if="blocksLoading.dbLoading" class="w-8 h-8 absolute right-5 top-5"></Spinner>
        <div class="text-2xl font-bold mb-6">База данных</div>
        <div class="flex flex-wrap items-center gap-5">
            <Button theme="success" icon="cloud_upload">
                <input 
                    type="file"
                    accept="application/JSON" 
                    class="p-0 m-0 absolute inset-0 z-10 opacity-0 cursor-pointer"
                    @change="onImportDB"
                >
                <span class="pointer-events-none">Импорт</span>
            </Button>
            <Button theme="info" icon="cloud_download" @click="onExportDB">Экспорт</Button>
        </div>
    </div>
    <div class="relative p-5 shadow-xl rounded-xl mb-5 bg-gray-600">
        <div class="text-2xl font-bold mb-6 text-red-400">Осторожно</div>
        <div class="flex flex-wrap items-center gap-5">
            <Button theme="danger" icon="delete_forever" @click.stop="onClearAppData">Очистить базу</Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import Button from '@/components/common/Button.vue'
import Spinner from '@/components/common/Spinner.vue'
import DB from '@/db/db';
import { toast } from '@/helpers/toast';
import { profilesFilter } from '@/reactive/useProfilesFilter';
import { profilesParsedList } from '@/reactive/useProfilesParsedList';
import { reviewsFilter } from '@/reactive/useReviewsFilter';
import { profilesSearchedList } from '@/reactive/useProfilesSearchedList';

import { MessagesEnum } from '@/types/enums';
import { exportDB, importDB } from 'dexie-export-import';
import { computed, reactive } from 'vue';

const blocksLoading = reactive({
    dbLoading: false
})

const isDangerMode = computed<boolean>(() => {
    let urlParams = new URLSearchParams(window.location.search)
    return urlParams.has('danger') ? true : false 
})

async function onSaveModulesData() {
    reviewsFilter.apiCreateFilter()
    profilesFilter.apiCreateFilter()
    profilesParsedList.apiCreateList()
    profilesSearchedList.apiCreateList()
}

async function onDropModulesData() {
    if (window.confirm('Удалям данные модулей ?')) {
        reviewsFilter.resetFields()
        reviewsFilter.apiRemoveFilter()
        profilesFilter.resetFields()
        profilesFilter.apiRemoveFilter()
        profilesParsedList.list.value = []
        profilesSearchedList.list.value = []
        profilesParsedList.apiRemoveList()
        profilesSearchedList.apiRemoveList()
    }
}

async function onClearAppData() {
    if (window.confirm('Удаляем базу данных ?')) {
        try {
            await DB.close()
            await chrome.storage.local.clear()
            await chrome.storage.local.set({appStartMessage: MessagesEnum.DBDropSuccess})
            window.indexedDB.deleteDatabase("avito_scraper")
            window.location.reload()
        } catch(error: any) {
            toast.show('error', MessagesEnum.DBDropError)
        }
    }
}

async function onImportDB(event: Event) {
    let target = event.target as HTMLInputElement
    if (target.files && target.files[0]) {

        try {
            let file = target.files[0]
            let blob = new Blob([file], {type: "application/json",})
            await importDB(blob)
            chrome.storage.local.set({appStartMessage: MessagesEnum.DBImportSuccess})
            window.location.reload()

        } catch (error: any) {

            console.log(error);
            toast.show('error', MessagesEnum.DBImportError)

        } finally {

        }
    }
}

async function onExportDB() {
    blocksLoading.dbLoading = true
    
    try {
        let date = new Date()
        let formattedDate = date.toLocaleString()
            .replace(',', '----')
            .replace(' ', '')
            .replace(/\:/g, '-')
            .replace(/\./g,'-')

        const fileName = `avito-scraper-dump----${formattedDate}.json`
        const dumpDB = await exportDB(DB)
        const file = new Blob([dumpDB], {type: 'text/json'})

        const link = document.createElement('a')
        link.href = URL.createObjectURL(file)
        link.download = fileName
        link.click()
        link.remove()
        toast.show('success', MessagesEnum.DBExportSuccess)

    } catch(error) {
        toast.show('error', MessagesEnum.DBExportError)
    } finally {
        blocksLoading.dbLoading = false
    }
}
</script>