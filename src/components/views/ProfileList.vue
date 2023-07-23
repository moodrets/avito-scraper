<template>
    <template v-if="loadingComponent">
        <div class="flex justify-center">
            <Spinner class="w-10 h-10 flex-none"></Spinner>
        </div>
    </template>
    <template v-else-if="profileDataList.length">
        <div
            v-for="profile in profileDataList"
            :key="profile.id"
            :class="profile.opened ? 'ring ring-blue-400' : ''"
            class="rounded-lg bg-gray-600 px-5 py-3 shadow-xl mb-3 cursor-pointer"
            @click="onOpenProfileDetails(profile)"
        >
            <div class="flex items-center gap-4 select-none">
                <div class="text-xl flex-1 min-w-0 font-medium">{{ profile.name }}</div>
                <div class="flex-none" @click.stop="onOpenLink(profile)">
                    <i class="font-icon text-3xl text-green-500">open_in_new</i>
                </div>
                <div class="flex-none" @click.stop="onCopyLink(profile)">
                    <i class="font-icon text-3xl text-sky-500">content_copy</i>
                </div>
                <div class="flex-none" @click.stop="onDeleteProfile(profile)">
                    <i class="font-icon text-3xl text-red-400">cancel</i>
                </div>
            </div>
            <div v-if="profile.opened" class="text-[14px] mt-5 pb-3">
                <template v-if="profile.loading">
                    <div class="flex justify-center">
                        <Spinner class="w-6 h-6"></Spinner>
                    </div>
                </template>
                <template v-if="profile.paringResults?.length">
                    <table class="w-full">
                        <tr>
                            <th class="text-left px-4 py-2 border border-white border-opacity-50">Дата парсинга</th>
                            <th class="text-left px-4 py-2 border border-white border-opacity-50">Рейтинг</th>
                            <th class="text-left px-4 py-2 border border-white border-opacity-50">Отзывы</th>
                            <th class="text-left px-4 py-2 border border-white border-opacity-50">Подписки</th>
                            <th class="text-left px-4 py-2 border border-white border-opacity-50">Продаж с доставкой</th>
                        </tr>
                        <tr v-for="parsingItem in profile.paringResults">
                            <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ toLocaleString(parsingItem.parsingDate) }}</td>
                            <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ parsingItem.rating }}</td>
                            <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ parsingItem.reviewsCount }}</td>
                            <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ parsingItem.subscribers }}</td>
                            <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ parsingItem.deliveryInfo }}</td>
                        </tr>
                    </table>
                </template>
                <template v-else>
                    <div class="text-center text-xl font-medium">Парсинги отзывов не найдены</div>
                </template>
            </div>
        </div>
    </template>
    <template v-else>
        <div class="text-center text-2xl font-bold">Ничего не найдено</div>
    </template>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Spinner from '@/components/common/Spinner.vue'

import { MessagesEnum } from '@/types/enums'
import { useToast } from '@/reactive/useToast'
import { apiGetProfileList, apiRemoveProfile } from '@/api/Profiles';
import { IProfileItemExt, IProfileItem } from '@/types/interfaces';
import { copyToBuffer } from '@/helpers/common';
import { apiGetParsingItemsByUrl, apiRemoveParsingItemsByUrl } from '@/api/ParsingResults';
import { toLocaleString } from '@/helpers/date';

const toast = useToast()

const loadingComponent = ref<boolean>(false)

const profileDataList = ref<IProfileItemExt[]>([])

function onOpenLink(profile: IProfileItemExt) {
    if (profile.url) {
        window.open(profile.url, '_blank');
    }
}

function onCopyLink(profile: IProfileItemExt) {
    if (profile.url) {
        copyToBuffer(profile.url)
        toast?.show('success', MessagesEnum.ProfileLinkCopied)
    }
}

async function onOpenProfileDetails(profile: IProfileItemExt) {
    profile.opened = !profile.opened

    if (!profile.opened) {
        profile.loading = false
        profile.paringResults = []

    } else {
        try {
            profile.loading = true
            const parsingResults = await apiGetParsingItemsByUrl(profile.url)

            if (parsingResults.length) {
                profile.paringResults = parsingResults
            }

        } catch(error: any) {
            
        } finally {
            profile.loading = false
        }
    }
}

async function onDeleteProfile(profile: IProfileItemExt) {
    if (window.confirm(`Удаляем "${profile.name}" ?`)) {
        if (profile.id) {
            await apiRemoveParsingItemsByUrl(profile.url)
            await apiRemoveProfile(profile.id)
            toast?.show('success', MessagesEnum.ProfileDeleted)
            getProfileList()
        }
    }
}

async function getProfileList() {
    try {
        loadingComponent.value = true

        const result = await apiGetProfileList()
        const convertedList: IProfileItemExt[] = result.map((item: IProfileItem) => ({
            ...item, 
            loading: false, 
            opened: false, 
            paringResults: []
        }))

        profileDataList.value = convertedList

    } catch(error: any) {

    } finally {
        loadingComponent.value = false
    }
}

onMounted(async () => {
    getProfileList()
})
</script>