<template>
    <ProfileInfo />
    <div v-if="reviewsList.length" class="pb-10">
        <div class="mb-8 font-bold text-xl">
            <div>Найдено отзывов - <strong>{{ reviewsList.length }}</strong></div>
        </div>
        <table class="w-full relative">
            <tr class="text-[16px] sticky top-[70px] bg-gray-600">
                <th class="text-left px-4 py-2 border border-white border-opacity-50">Дата</th>
                <th class="text-left px-4 py-2 border border-white border-opacity-50">Оценка</th>
                <th class="text-left px-4 py-2 border border-white border-opacity-50">Название товара</th>
                <th class="text-left px-4 py-2 border border-white border-opacity-50">Доставка</th>
            </tr>
            <tr v-for="item, index in reviewsList" :key="index" class="text-[14px] hover:bg-gray-600">
                <td class="px-4 py-2 border border-white border-opacity-50 font-medium">{{ toLocaleString(item.date)?.slice(0, 10) }}</td>
                <td class="px-4 py-2 border border-white border-opacity-50">
                    <div class="flex-none flex items-center">
                        <div class="text-base font-medium mr-1">({{ item.rating }}) - </div>
                        <div v-for="star in item.rating" class="text-[18px] font-icon text-yellow-400">star</div>
                    </div>
                </td>
                <td class="px-4 py-2 border border-white border-opacity-50">
                    <div class="flex items-center gap-4">
                        <div class="font-icon text-green-400 cursor-pointer" @click.stop="onCopyProductName(item.productName)">content_copy</div>
                        <div>{{ item.productName }}</div>
                    </div>
                </td>
                <td class="px-4 py-2 border border-white border-opacity-50">
                    <strong :class="item.delivery ? 'text-green-400' : 'text-red-400'">{{ item.delivery ? 'Да' : 'Нет' }}</strong>
                </td>
            </tr>
        </table>
    </div>
    <template v-else>
        <div class="text-center text-2xl font-bold">Ничего не найдено</div>
    </template>
</template>

<script setup lang="ts">
import ProfileInfo from '@/components/common/ProfileInfo.vue'
import { copyToBuffer } from '@/helpers/common';
import { toLocaleString } from '@/helpers/date';
import { reviewsList } from '@/reactive/useReviewsList';
import { useToast } from '@/reactive/useToast';
import { MessagesEnum } from '@/types/enums';

const toast = useToast()

function onCopyProductName(productName: string){
    copyToBuffer(productName)
    toast?.show('success', MessagesEnum.ProductNameCopied)
}
</script>