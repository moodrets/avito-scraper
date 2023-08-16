<template>
    <form @submit.prevent="onSubmit()" :class="{'pointer-events-none': profilesFilter.state.loading}">
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
            >Очистить список</Button>
        </div>
    </form>
    <div v-if="profilesFilter.state.profilesList.length" class="mt-10 pb-10">
        <div class="mb-8 font-bold text-xl">
            <div>Найдено продавцов - <strong>{{ profilesFilter.state.profilesList.length }}</strong></div>
        </div>
        <table class="w-full relative">
            <tr class="text-[16px] sticky top-[64px] bg-gray-600">
                <th class="text-left px-4 py-2 border border-white border-opacity-50">Имя</th>
                <th class="text-left px-4 py-2 border border-white border-opacity-50">Рейтинг</th>
                <th class="text-left px-4 py-2 border border-white border-opacity-50">Отзывы</th>
                <th class="text-left px-4 py-2 border border-white border-opacity-50">Найден в базе</th>
            </tr>
            <tr v-for="profile in profilesFilter.state.profilesList" :key="profile.name" class="text-[14px] hover:bg-gray-600">
                <td class="px-4 py-2 border border-white border-opacity-50 font-medium">
                    <div class="flex items-center gap-4">
                        <a class="text-white hover:text-white text-xl font-medium border-b border-dashed border-white" target="_blank" :href="profile.url">{{ profile.name }}</a>
                    </div>
                </td>
                <td class="px-4 py-2 border border-white border-opacity-50 font-medium">
                    {{ profile.rating }}
                </td>
                <td class="px-4 py-2 border border-white border-opacity-50 font-medium">
                    {{ profile.reviewsCount }}
                </td>
                <td class="px-4 py-2 border border-white border-opacity-50 font-medium">
                    <strong class="text-red-400">Нет</strong>
                </td>
            </tr>
        </table>
    </div>
</template>

<script setup lang="ts">
import Button from '@/components/common/Button.vue'
import { profilesFilter } from '@/reactive/useProfilesFilter';

async function onSubmit() {
    profilesFilter.parsingStart()
}
</script>