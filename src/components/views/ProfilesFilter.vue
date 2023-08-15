<template>
    <form @submit.prevent="onSubmit()">
        <div class="grid grid-cols-4 gap-5">
            <div>
                <div class="mb-2 text-sm font-medium">Категория</div>
                <div class="flex items-center gap-4">
                    <i 
                        class="font-icon text-3xl block text-white cursor-pointer" 
                        :class="{'animate-spin': profilesFilter.state.categoriesLoading}"
                        @click="getCategories" 
                    >refresh</i>
                    <select
                        v-model="profilesFilter.fields.category"
                        required 
                        class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400">
                        <option v-if="Object.keys(profilesFilter.state.categories).length" value="">Выберите категорию</option>
                        <optgroup v-for="(value, key) in profilesFilter.state.categories" :label="(key as string)">
                            <option v-for="option in value" :value="option.url">{{ option.text }}</option>
                        </optgroup>
                    </select>
                </div>
            </div>
            <div>
                <div class="mb-2 text-sm font-medium">Имя продавца</div>
                <input 
                    v-model="profilesFilter.fields.profileName"
                    type="text"
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div>
                <div class="mb-2 text-sm font-medium">Количество отзывов</div>
                <input 
                    v-model="profilesFilter.fields.reviewsCount"
                    type="number"
                    min="0"
                    required
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
        </div>
    </form>
</template>

<script setup lang="ts">
import Button from '@/components/common/Button.vue'
import { toast } from '@/helpers/toast';
import { profilesFilter } from '@/reactive/useProfilesFilter';

async function onSubmit() {
    profilesFilter.setCategoryPageFilter()
}

async function getCategories() {
    profilesFilter.state.categoriesLoading = true
    profilesFilter.getCategories()
}
</script>