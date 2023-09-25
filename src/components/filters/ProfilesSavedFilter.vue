<template>
    <div class="grid grid-cols-2 gap-5">
        <div>
            <div class="mb-2 text-sm font-medium">Имя пользователя</div>
            <input 
                v-model="profilesSavedFilter.fields.name"
                autocomplete="off"
                type="search"
                class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
            >
        </div>
        <div>
            <div class="mb-2 text-sm font-medium">Комментарий</div>
            <input 
                v-model="profilesSavedFilter.fields.comment"
                autocomplete="off"
                type="search"
                class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
            >
        </div>
    </div>
</template>

<script lang="ts" setup>
import { profilesSavedFilter } from '@/reactive/useProfilesSavedFilter'
</script>