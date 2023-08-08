<template>
    <template v-if="profileInfoList.list.value.length">
        <div
            v-for="profile in profileInfoList.list.value"
            :key="profile.url"
            class="relative rounded-xl shadow-xl bg-gray-600 text-[16px] mb-3"
        >
            <div
                class="relative flex items-start p-4 select-none cursor-pointer rounded-xl"
                :style="{'background-image': `linear-gradient(45deg, rgb(75 85 99) 0%, rgb(75 85 99) 70%, ${profile.color.bg} 100%)`}"
                @click="onOpenResults(profile)"
            >
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-4 mb-4">
                        <a
                            class="text-white hover:text-white text-xl font-medium border-b border-dashed border-white"
                            @click.stop="onOpenLink(profile)"
                        >{{ profile.name }}</a>
                        <div
                            v-if="profile.comment" 
                            class="text-[16px] text-sky-300 font-medium italic"
                        >{{ profile.comment }}</div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="text-[16px] text-orange-300 font-medium">{{ profile.rating }}</div>
                        <div class="text-[16px] text-yellow-300 font-medium">{{ profile.reviewsCount }}</div>
                        <div class="text-[16px] text-teal-300 font-medium">{{ profile.subscribers }}</div>
                        <div class="text-[16px] text-rose-300 font-medium">{{ profile.deliveryInfo }}</div>
                        <div v-if="profile.existsInDataBase" class="text-[16px] text-green-300 font-medium">Найден в базе</div>
                        <div v-if="profile.savedDate" class="text-[16px] text-gray-300 font-medium">{{ profile.savedDate ? toLocaleString(profile.savedDate) : '' }}</div>
                    </div>
                </div>
                <div class="flex-none flex items-center gap-4">
                    <div v-if="!profile.existsInDataBase" class="flex-none ml-auto" @click.stop="onSave(profile)">
                        <i class="font-icon text-3xl text-white drop-shadow-xl">cloud_upload</i>
                    </div>
                    <div class="flex-none" @click.stop="onCopy(profile)">
                        <i class="font-icon text-3xl text-white drop-shadow-xl">content_copy</i>
                    </div>
                    <div class="flex-none" @click.stop="onMark(profile)">
                        <i 
                            class="font-icon text-3xl drop-shadow-xl" 
                            :class="[profile.marked ? 'text-gray-500' : 'text-white']"
                        >bookmark</i>
                    </div>
                </div>
            </div>
            
            <div v-if="profile.opened" class="text-[14px] px-4 p-5">
                <div v-if="!profile.existsInDataBase" class="mb-8">
                    <div class="mb-3 opacity-80">Комментарий:</div>
                    <input
                        v-model="profile.comment"
                        type="search"
                        required
                        class="text-base w-1/4 max-w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                    >
                </div>
                <template v-if="profile.reviewsList?.length">
                    <div v-if="profile.opened">
                        <div class="mb-8 font-bold text-xl">
                            <div>Найдено отзывов - <strong>{{ profile.reviewsList.length }}</strong></div>
                        </div>
                        <table class="w-full relative">
                            <tr class="text-[16px] sticky top-[64px] bg-gray-600">
                                <th class="text-left px-4 py-2 border border-white border-opacity-50">
                                    <div class="flex items-center cursor-pointer" @click="onSort(profile, 'date')">
                                        <div class="font-icon flex-none mr-2" :class="{'text-cyan-400': profile.reviewsSortedBy === 'date'}">sort</div>
                                        <div>Дата</div>
                                    </div>
                                </th>
                                <th class="text-left px-4 py-2 border border-white border-opacity-50">
                                    <div class="flex items-center cursor-pointer" @click="onSort(profile, 'rating')">
                                        <div class="font-icon flex-none mr-2" :class="{'text-cyan-400': profile.reviewsSortedBy === 'rating'}">sort</div>
                                        <div>Оценка</div>
                                    </div>
                                </th>
                                <th class="text-left px-4 py-2 border border-white border-opacity-50">
                                    <div class="flex items-center cursor-pointer" @click="onSort(profile, 'productName')">
                                        <div class="font-icon flex-none mr-2" :class="{'text-cyan-400': profile.reviewsSortedBy === 'productName'}">sort</div>
                                        <div>Название товара</div>
                                    </div>
                                </th>
                                <th class="text-left px-4 py-2 border border-white border-opacity-50">
                                    Доставка
                                </th>
                            </tr>
                            <tr v-for="item, index in profile.reviewsList" :key="profile.reviewsSortedBy + index" class="text-[14px] hover:bg-gray-600">
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
                </template>
                <template v-else>
                    <div class="text-xl font-bold text-red-300">Результатов не найдено</div>
                </template>
            </div>
        </div>
        
        <Modal
            v-if="profileInfoList.state.contentModalVisible"
            width="800px"
            @close="onCloseModal"
        >
            <template v-if="profileInfoList.state.contentModalData.length">
                <div
                    v-for="result in profileInfoList.state.contentModalData" 
                    class="flex items-center gap-2 py-0.5 px-1 mb-[2px] mr-5 font-medium"
                    :style="{'background-color': result.color.bg, 'color': result.color.text}"
                    :title="result.info"
                >
                    <div>{{ result.productName }}</div>
                    <div v-if="!result.count">{{ toLocaleString(result.date)?.slice(0, 10) }}</div>
                    <strong v-if="result.count">({{ result.count }})</strong>
                </div>
            </template>
            <template v-else>
                <div class="text-center text-xl font-bold">Результаты не найдены</div>
            </template>
        </Modal>
    </template>
    <div v-else class="text-center text-xl font-bold">Ничего не найдено</div>
</template>

<script lang="ts" setup>
import Modal from '@/components/common/Modal.vue'
import { onMounted, onBeforeUnmount } from 'vue';
import { copyToBuffer } from '@/helpers/common';
import { toLocaleString } from '@/helpers/date'
import { MessagesEnum } from '@/types/enums';
import { toast } from '@/helpers/toast';
import { IProfileItem, ReviewsSortBy, profileInfoList } from '@/reactive/useProfileInfoList';

function onCloseModal() {
    profileInfoList.state.contentModalVisible = false
    profileInfoList.state.contentModalData = []
}

function onCopyProductName(productName: string) {
    copyToBuffer(productName)
    toast.show('success', MessagesEnum.ProductNameCopied)
}

function onSort(profile: IProfileItem, sortBy: ReviewsSortBy) {
    profileInfoList.sortResults(profile, sortBy)
}

function onOpenResults(profile: IProfileItem) {
    if (profile.opened === undefined) profile.opened = true
    profile.opened = !profile.opened
}

function onOpenLink(profile: IProfileItem) {
    if (profile.url) {
        window.open(profile.url, '_blank')
    }
}

function onMark(profile: IProfileItem) {
    profile.marked = !profile.marked
}

async function onSave(profile: IProfileItem) {
    profileInfoList.apiProfileCreate(profile)
}

async function onCopy(profile: IProfileItem) {
    profileInfoList.copyItemInfo(profile)
}

onBeforeUnmount(() => {
    profileInfoList.state.viewAllButtonVisible = false
    profileInfoList.state.viewMoreThanButtonVisible = false
})

onMounted(() => {
    profileInfoList.state.viewAllButtonVisible = true
    profileInfoList.state.viewMoreThanButtonVisible = true

    profileInfoList.list.value.forEach(async profile => {
        await profileInfoList.apiCheckInDB(profile)
    })

    if (profileInfoList.list.value.length === 1) {
        profileInfoList.list.value[0].opened = true
    }
})
</script>