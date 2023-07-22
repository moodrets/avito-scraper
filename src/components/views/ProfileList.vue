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
            :class="profile.opened ? 'outline outline-3 outline-blue-400' : ''"
            class="rounded-lg bg-gray-600 px-5 py-3 shadow-xl mb-4 cursor-pointer"
            @click="profile.opened = !profile.opened"
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
            <div v-if="profile.opened" class="text-[14px] mt-5">
                <table class="table-fixed w-full">
                    <tr>
                        <th class="text-left px-4 py-2 border border-white border-opacity-50">Дата</th>
                        <th class="text-left px-4 py-2 border border-white border-opacity-50">Рейтинг</th>
                        <th class="text-left px-4 py-2 border border-white border-opacity-50">Отзывы</th>
                        <th class="text-left px-4 py-2 border border-white border-opacity-50">Подписки</th>
                        <th class="text-left px-4 py-2 border border-white border-opacity-50">Продаж с доставкой</th>
                    </tr>
                    <!-- <tr v-for="history in profile.parsingHistory">
                        <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ history.formattedDate }}</td>
                        <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ history.rating }}</td>
                        <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ history.reviewsCount }}</td>
                        <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ history.subscribers }}</td>
                        <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ history.deliveryInfo }}</td>
                    </tr> -->
                </table>
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
import { IProfileItemExt, IProfileItem } from '@/types/infterfaces';
import { copyToBuffer } from '@/helpers/common';

const toast = useToast()

const loadingComponent = ref<boolean>(false)

const profileDataList = ref<IProfileItemExt[]>([])

function onOpenLink(profile: any) {
    if (profile.url) {
        window.open(profile.url, '_blank');
    }
}

function onCopyLink(profile: any) {
    if (profile.url) {
        copyToBuffer(profile.url)
        toast?.show('success', MessagesEnum.ProfileLinkCopied)
    }
}

async function onDeleteProfile(profile: any) {
    if (window.confirm(`Удаляем "${profile.name}" ?`)) {
        if (profile.id) {
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
        const convertedList: IProfileItemExt[] = result.map((item: IProfileItem) => ({...item, opened: false}))

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