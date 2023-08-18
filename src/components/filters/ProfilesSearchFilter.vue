<template>
    <form class="pb-14" :class="{'pointer-events-none': profilesFilter.state.loading}" @submit.prevent="onSubmit()">
        <div class="grid grid-cols-4 gap-5">
            <div class="col-span-4">
                <div class="mb-2 text-sm font-medium">Страница категории</div>
                <div class="flex items-center gap-4">
                    <i v-if="profilesFilter.state.loading" class="font-icon text-3xl block text-green-400 animate-spin">rotate_right</i>
                    <div v-if="profilesFilter.state.currentPage > 0" class="flex-none font-medium text-[16px]">
                        <strong class="text-green-400">{{ profilesFilter.state.currentPage }}</strong>
                        -
                        {{ profilesFilter.pagesRange.value.end }}
                    </div>
                    <input 
                        v-model="profilesFilter.fields.categoryUrl"
                        type="text"
                        class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                    >
                </div>
            </div>
            <div>
                <div class="mb-2 text-sm font-medium">Количество отзывов профиля</div>
                <input 
                    v-model="profilesFilter.fields.reviewsCount"
                    type="number"
                    min="0"
                    required
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div>
                <div class="mb-2 text-sm font-medium">Диапазон страниц (формат 1-20)</div>
                <input 
                    v-model="profilesFilter.fields.pagesRange"
                    required
                    type="text"
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div>
                <div class="mb-2 text-sm font-medium">Имя профиля</div>
                <input 
                    v-model="profilesFilter.fields.profileName"
                    type="text"
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
        </div>
        <div class="flex items-center gap-4 mt-10">
            <Button
                theme="success" 
                type="submit" 
                icon="find_in_page"
            >Начать поиск</Button>
            <Button
                theme="danger" 
                type="button" 
                icon="delete_sweep"
                @click="profilesFilter.clearProfilesList()"
            >Очистить список</Button>
        </div>
    </form>
</template>

<script setup lang="ts">
import Button from '@/components/common/Button.vue'
import { profilesFilter } from '@/reactive/useProfilesFilter';

async function onSubmit() {
    profilesFilter.parsingStart()
}
</script>