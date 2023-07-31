<template>
    <template v-if="profileInfoList.list.value.length">
        <div
            v-for="profile in profileInfoList.list.value"
            :key="profile.url"
            class="relative rounded-xl shadow-xl bg-gray-600 p-5 mb-5 text-[16px]"
        >
            <!-- profile color -->
            <div 
                class="absolute right-5 top-5 w-12 h-8 rounded-md" 
                :style="{'background-color': profile.color, 'box-shadow': '0 0 10px rgba(0,0,0,.35)'}
            "></div>

            <!-- profile info -->
            <div>
                <div class="space-y-2">
                    <div class="flex items-center">
                        <div class="font-bold">{{ profile.name }}</div>
                    </div>
                    <div class="flex items-center">
                        <a :href="profile.url" target="_blank">{{ profile.url }}</a>
                    </div>
                    <div class="flex items-center">
                        <div class="font-bold">{{ profile.rating }}</div>
                    </div>
                    <div class="flex items-center">
                        <div class="font-bold">{{ profile.reviewsCount }}</div>
                    </div>
                    <div class="flex items-center">
                        <div class="font-bold">{{ profile.subscribers }}</div>
                    </div>
                    <div class="flex items-center">
                        <div class="font-bold">{{ profile.deliveryInfo }}</div>
                    </div>
                    <div class="flex items-center">
                        <div class="mr-3 opacity-80">Дата парсинга:</div>
                        <div class="font-bold">{{ toLocaleString(profile.parsingDate) }}</div>
                    </div>
                    <div class="flex items-center" v-if="profile.savedDate">
                        <div class="mr-3 opacity-80">Дата сохранения:</div>
                        <div class="font-bold">{{ toLocaleString(profile.savedDate) }}</div>
                    </div>
                    <div class="flex items-center">
                        <div class="mr-3 opacity-80">Найден в базе:</div>
                        <div class="font-bold">
                            <strong 
                                :class="[profile.existsInDataBase ? 'text-green-400' : 'text-red-400']"
                            >{{ profile.existsInDataBase ? 'Да' : 'Нет' }}</strong>
                        </div>
                    </div>
                    <div v-if="profile.id" class="flex items-center">
                        <div class="mr-3 opacity-80">ID:</div>
                        <div class="font-bold">{{ profile.id }}</div>
                    </div>
                    <div v-if="profile.existsInDataBase" class="flex items-center">
                        <div class="mr-3 opacity-80">Комментарий:</div>
                        <em class="text-[16px] text-sky-300 font-medium">{{ profile.comment }}</em>
                    </div>
                    <div v-else>
                        <div class="mb-3 opacity-80">Комментарий:</div>
                        <input
                            v-model="profile.comment"
                            type="search"
                            required
                            class="text-base w-[640px] max-w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                        >
                    </div>
                </div>
                <div>
                    <div class="flex items-center gap-4 mt-8 empty:hidden">
                        <Button 
                            v-if="profile.reviewsList?.length" 
                            type="button" 
                            theme="success" 
                            icon="content_copy" 
                            @click.prevent="onCopy(profile)"
                        >Копировать результаты</Button>
                        <Button 
                            v-if="!profile.existsInDataBase"
                            type="button" 
                            icon="cloud_upload" 
                            @click.prevent="onSave(profile)"
                        >Сохранить в базу</Button>
                        <Button
                            theme="warning"
                            v-if="profile.reviewsList?.length" 
                            type="button" 
                            :icon="profile.opened ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" 
                            @click.prevent="onOpenResults(profile)"
                        >
                            {{ profile.opened ? 'Скрыть результаты' : 'Раскрыть результаты' }}
                            <strong> ({{ profile.reviewsList.length }})</strong>
                        </Button>
                    </div>
                </div>
            </div>
            
            <!-- profile results list -->
            <template v-if="profile.reviewsList?.length">
                <div v-if="profile.opened" class="mt-10">
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
                <div class="text-xl font-bold mt-5 text-red-400">Результатов не найдено</div>
            </template>
        </div>
        
        <Modal
            v-if="profileInfoList.state.contentModalVisible"
            width="800px"
            @close="onCloseModal"
        >
            <div v-html="profileInfoList.state.contentModalText"></div>
        </Modal>

    </template>
    <div v-else class="text-center text-xl font-bold">Ничего не найдено</div>
</template>

<script lang="ts" setup>
import Button from '@/components/common/Button.vue'
import Modal from '@/components/common/Modal.vue'
import { onMounted, onBeforeUnmount } from 'vue';
import { copyToBuffer } from '@/helpers/common';
import { toLocaleString } from '@/helpers/date'
import { MessagesEnum } from '@/types/enums';
import { toast } from '@/helpers/toast';
import { IProfileItem, ReviewsSortBy, profileInfoList } from '@/reactive/useProfileInfoList';

function onCloseModal() {
    profileInfoList.state.contentModalVisible = false
    profileInfoList.state.contentModalText = ''
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

async function onSave(profile: IProfileItem) {
    profileInfoList.apiProfileCreate(profile)
}

async function onCopy(profile: IProfileItem) {
    profileInfoList.copyItemInfo(profile)
}

onBeforeUnmount(() => {
    profileInfoList.state.viewAllButtonVisible = false
    profileInfoList.state.viewMoreThanFiveButtonVisible = false
})

onMounted(() => {
    profileInfoList.state.viewAllButtonVisible = true
    profileInfoList.state.viewMoreThanFiveButtonVisible = true

    profileInfoList.list.value.forEach(async profile => {
        await profileInfoList.apiCheckInDB(profile)
    })

    if (profileInfoList.list.value.length > 0 && profileInfoList.list.value.length < 2) {
        profileInfoList.list.value[0].opened = true
    }
})
</script>