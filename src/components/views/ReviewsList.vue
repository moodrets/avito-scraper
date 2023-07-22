<template>
    <ProfileInfo />
    <div v-if="reviewsList.length" class="pb-10">
        <div class="mb-8 font-bold text-xl">
            <div>Найдено отзывов - <strong>{{ reviewsList.length }}</strong></div>
        </div>
        <div 
            v-for="item, index in reviewsList"
            :key="index"
            :class="item.delivery ? 'outline outline-3 outline-green-500' : ''"
            class="rounded-lg bg-gray-600 p-3 shadow-xl mb-4"
        >
            <div class="flex flex-wrap items-center gap-5 mb-2">
                <div class="font-medium text-base">{{ item.dateText }}</div>
                <div class="flex-none flex items-center">
                    <div class="text-base font-bold mr-1">({{ item.rating }}) - </div>
                    <div v-for="star in item.rating" class="font-icon text-yellow-400">star</div>
                </div>
                <div class="text-base">
                    <span class="text-medium">Доставка - </span> 
                    <strong :class="item.delivery ? 'text-green-400' : 'text-red-400'">{{ item.delivery ? 'Да' : 'Нет' }}</strong>
                </div>
            </div>
            <div class="text-xl font-bold">{{ item.productName }}</div>
        </div>
    </div>
    <template v-else>
        <div class="text-center text-2xl font-bold">Ничего не найдено</div>
    </template>
</template>

<script setup lang="ts">
import ProfileInfo from '@/components/common/ProfileInfo.vue'
import { reviewsList } from '@/reactive/useReviewsList';
</script>