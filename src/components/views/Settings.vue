<template>
    <div class="mb-3">
        <Button theme="danger" icon="delete_sweep" @click.stop="onClear">Очистить хранилище</Button>
    </div>
</template>

<script setup lang="ts">
import Button from '@/components/common/Button.vue'
import { profileInfo } from '@/reactive/useProfileInfo';

async function onClear() {
    if (window.confirm('Мы сносим пользователей и результаты парсинга ?')) {
        await chrome.storage.local.remove(['profileList', 'parsingResults'])
        profileInfo.value && (profileInfo.value.existsInDataBase = false)
        window.location.reload()
    }
}
</script>