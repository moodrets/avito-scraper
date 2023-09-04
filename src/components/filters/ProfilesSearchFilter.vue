<template>
    <form 
        class="pb-14" 
        :class="{'pointer-events-none': profilesSearchedList.state.loading}" 
        @submit.prevent="onSubmit()"
    >
        <div class="grid grid-cols-6 gap-5">
            <div class="col-span-6">
                <div class="mb-2 text-sm font-medium">Страница категории</div>
                <div class="flex items-center gap-4">
                    <i v-if="profilesSearchedList.state.loading" class="font-icon text-3xl block text-green-400 animate-spin">rotate_right</i>
                    <div v-if="profilesFilter.state.currentPage > 0" class="flex-none font-medium text-[16px]">
                        <strong class="text-green-400">{{ profilesFilter.state.currentPage }}</strong>
                        -
                        {{ profilesFilter.fields.pageEnd }}
                    </div>
                    <div class="flex-1">
                        <input
                            v-model="profilesFilter.fields.categoryUrl"
                            type="search"
                            required="true"
                            class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                            @focus="onFocusCategoryInput"
                            @input="onInputCategoryInput"
                        >
                        <div v-if="profilesFilter.fields.pageTitle" class="mt-3 font-medium" v-html="profilesFilter.fields.pageTitle"></div>
                    </div>
                </div>
            </div>
            <div>
                <div class="mb-2 text-sm font-medium">Страница от</div>
                <input 
                    v-model="profilesFilter.fields.pageStart"
                    required
                    type="number"
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div>
                <div class="mb-2 text-sm font-medium">Страница до</div>
                <input 
                    v-model="profilesFilter.fields.pageEnd"
                    required
                    type="number"
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div>
                <div class="mb-2 text-sm font-medium">Количество отзывов</div>
                <input 
                    v-model="profilesFilter.fields.reviewsCount"
                    type="number"
                    min="0"
                    step="100"
                    required
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div class="col-span-3">
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
                @click="profilesSearchedList.clearProfilesList()"
            >Очистить список</Button>
        </div>
    </form>
</template>

<script setup lang="ts">
import Button from '@/components/common/Button.vue'
import { profilesFilter } from '@/reactive/useProfilesFilter';
import { profilesSearchedList } from '@/reactive/useProfilesSearchedList';

async function onSubmit() {
    profilesFilter.parsingStart()
}

function onInputCategoryInput(event: Event) {
    profilesFilter.fields.pageTitle = ''
    profilesFilter.state.currentPage = 0
    profilesFilter.fields.pageStart = 1
    profilesFilter.fields.pageEnd = 10
}

function onFocusCategoryInput(event: Event) {
    (event.target as HTMLInputElement).select()
}
</script>