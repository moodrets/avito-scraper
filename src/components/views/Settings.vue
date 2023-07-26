<template>
    <div class="p-5 shadow-xl rounded-xl mb-5 bg-gray-600">
        <div class="text-2xl font-bold mb-8">Локальное хранилище (временная опция)</div>
        <div class="flex flex-wrap items-center gap-5">
            <div>
                <Button theme="danger" icon="delete_sweep" @click.stop="onClear">Очистить хранилище</Button>
            </div>
        </div>
    </div>
    <div class="p-5 shadow-xl rounded-xl mb-5 bg-gray-600">
        <div class="text-2xl font-bold mb-8">База данных</div>
        <div class="flex flex-wrap items-center gap-5">
            <Button theme="success" icon="cloud_upload">
                <input type="file" class="p-0 m-0 absolute inset-0 z-10 opacity-0 cursor-pointer">
                <span class="pointer-events-none">Импорт</span>
            </Button>
            <Button theme="info" icon="cloud_download">Экспорт</Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import Button from '@/components/common/Button.vue'

async function onClear() {
    if (window.confirm('Мы сносим пользователей и результаты парсинга ?')) {
        await chrome.storage.local.remove(['profileList', 'parsingResults', 'filterFields'])
        window.location.reload()
    }
}
</script>