<template>
    <div class="relative p-5 shadow-xl rounded-xl mb-5 bg-gray-600">
        <Spinner v-if="blocksLoading.dbLoading" class="w-8 h-8 absolute right-5 top-5"></Spinner>
        <div class="text-2xl font-bold mb-6">База данных</div>
        <div class="flex flex-wrap items-center gap-5">
            <Button theme="success" icon="cloud_upload">
                <input 
                    type="file"
                    accept="application/JSON" 
                    class="p-0 m-0 absolute inset-0 z-10 opacity-0 cursor-pointer"
                >
                <span class="pointer-events-none">Импорт</span>
            </Button>
            <Button theme="info" icon="cloud_download" @click="onExportDB">Экспорт</Button>
        </div>
    </div>
    <div class="p-5 shadow-xl rounded-xl mb-5 bg-gray-600 ring-4 ring-red-400">
        <div class="text-2xl font-bold mb-6 text-red-400">Осторожно!</div>
        <div class="flex flex-wrap items-center gap-5">
            <Button theme="danger" icon="delete_sweep" @click.stop="onClear">Очистить localStorage</Button>
            <Button theme="danger" icon="delete_forever" @click.stop="onDrop">Очистить IndexedDB</Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import Button from '@/components/common/Button.vue'
import Spinner from '@/components/common/Spinner.vue'
import DB from '@/db/db';

import { MessagesEnum } from '@/types/enums';
import { useToast } from '@/reactive/useToast';
import { exportDB } from 'dexie-export-import';
import { computed, reactive } from 'vue';

const toast = useToast()

const blocksLoading = reactive({
    dbLoading: false
})

const isDangerMode = computed<boolean>(() => {
    let urlParams = new URLSearchParams(window.location.search)
    return urlParams.has('danger') ? true : false 
})

async function onDrop(){
    if (window.confirm('Удаляем базу данных ?')) {
        // if (window.confirm('Вы точно в этом уверены ?')) {
            try {
                await DB.close()
                window.indexedDB.deleteDatabase("avito_scraper");
                toast?.show('error', MessagesEnum.DBDropSuccess)
                window.location.reload()
            } catch(error: any) {
                toast?.show('error', MessagesEnum.DBDropError)
            }
        // }
    }
}

async function onClear() {
    if (window.confirm('Чистим хранилище ?')) {
        await chrome.storage.local.remove([
            'profileList', 
            'parsingResults', 
            'filterFields',
            'reviewsFilter'
        ])
        window.location.reload()
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
        link.click();
        link.remove()
        toast?.show('success', MessagesEnum.DBExportSuccess)

    } catch(error) {
        toast?.show('error', MessagesEnum.DBExportError)
    } finally {
        blocksLoading.dbLoading = false
    }
}
</script>