<template>
    <ProfileInfo />
    <div v-if="reviewsList.length" class="pb-10">
        <div 
            v-for="item in reviewsList" 
            class="rounded-lg bg-gray-600 p-3 shadow-xl mb-4"
            :class="item.delivery ? 'outline outline-offset-[3px] outline-green-500' : ''"
        >
            <div class="flex items-center mb-2">
                <div class="text-medium text-base mr-4">{{ item.dateText }}</div>
                <div class="flex-none flex items-center mr-8">
                    <div v-for="star in item.rating" class="font-icon text-yellow-400">star</div>
                    <div class="text-xl font-bold ml-2">({{ item.rating }})</div>
                </div>
                <div class="text-base font-medium ml-auto">Доставка - <span :class="item.delivery ? 'text-green-400' : 'text-red-400'">{{ item.delivery ? 'Да' : 'Нет' }}</span></div>
            </div>
            <div class="text-xl font-bold">{{ item.productName }}</div>
        </div>
    </div>
    <template v-else>
        <div class="text-center text-2xl font-bold">Ничего нет</div>
    </template>
</template>

<script setup lang="ts">
import ProfileInfo from '@/components/common/ProfileInfo.vue'
import { reviewsList } from '@/reactive/useReviewsList';
</script>