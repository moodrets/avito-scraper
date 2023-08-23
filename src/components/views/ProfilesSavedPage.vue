<template>
    <template v-if="loadingComponent">
        <div class="flex justify-center">
            <Spinner class="w-10 h-10 flex-none"></Spinner>
        </div>
    </template>
    <template v-else-if="profileSavedList.list.value.length">
        <div
            v-for="profile in profileSavedList.list.value"
            :key="profile.id"
            :class="profile.opened ? 'ring ring-blue-400' : ''"
            class="rounded-xl bg-gray-600 shadow-xl mb-3"
        >
            <div
                class="flex items-start p-4 select-none cursor-pointer"
                @click="onOpenProfileDetails(profile)"
            >
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-4 mb-4">
                        <a
                            class="text-white hover:text-white text-xl font-medium border-b border-dashed border-white"
                            @click.stop="onOpenLink(profile)"
                        >{{ profile.name }}</a>
                        <div v-if="profile.comment" class="text-[16px] text-sky-300 font-medium italic">{{ profile.comment }}</div>
                    </div>
                    <div class="flex flex-wrap items-center gap-4 text-[16px] font-medium">
                        <div class="text-orange-300">{{ profileSavedList.getLastParsingInfo(profile)?.rating }}</div>
                        <div class="text-yellow-300">{{ profileSavedList.getLastParsingInfo(profile)?.reviewsCount }}</div>
                        <div class="text-teal-300">{{ profileSavedList.getLastParsingInfo(profile)?.subscribers }}</div>
                        <div class="text-rose-300">{{ profileSavedList.getLastParsingInfo(profile)?.deliveryInfo }}</div>
                        <div class="text-amber-300">Активные - {{ profileSavedList.getLastParsingInfo(profile)?.activeAdds }}</div>
                        <div v-if="profileSavedList.getLastParsingInfo(profile)?.completedAdds" class="text-lime-300">Завершенные - {{ profileSavedList.getLastParsingInfo(profile)?.completedAdds }}</div>
                        <div class="text-gray-300">{{ profileSavedList.getLastParsingInfo(profile)?.parsingDate ? toLocaleString(profileSavedList.getLastParsingInfo(profile)?.parsingDate) : '' }}</div>
                    </div>
                </div>
                <div class="flex-none flex items-center gap-4">
                    <div class="flex-none ml-auto" @click.stop="onPushLinkToFilter(profile)">
                        <i class="font-icon text-3xl text-amber-400">add_to_photos</i>
                    </div>
                    <div class="flex-none ml-auto" @click.stop="onShowEditModal(profile)">
                        <i class="font-icon text-3xl text-green-400">edit</i>
                    </div>
                    <div class="flex-none" @click.stop="onCopyLink(profile)">
                        <i class="font-icon text-3xl text-sky-400">content_copy</i>
                    </div>
                    <div class="flex-none" @click.stop="onDeleteProfile(profile)">
                        <i class="font-icon text-3xl text-red-400">delete_forever</i>
                    </div>
                </div>
            </div>
            <div v-if="profile.opened" class="text-[14px] px-4 p-5">
                <template v-if="profile.parsingResults?.length">
                    <table class="w-full">
                        <tr>
                            <th class="text-left px-4 py-2 border border-white border-opacity-50">Дата парсинга</th>
                            <th class="text-left px-4 py-2 border border-white border-opacity-50">Рейтинг</th>
                            <th class="text-left px-4 py-2 border border-white border-opacity-50">Отзывы</th>
                            <th class="text-left px-4 py-2 border border-white border-opacity-50">Подписки</th>
                            <th class="text-left px-4 py-2 border border-white border-opacity-50">Продаж с доставкой</th>
                            <th class="text-left px-4 py-2 border border-white border-opacity-50">Активные</th>
                            <th class="text-left px-4 py-2 border border-white border-opacity-50">Завершенные</th>
                        </tr>
                        <tr 
                            v-for="parsingItem, parsingItemIndex in profile.parsingResults" 
                            :key="parsingItemIndex"
                        >
                            <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ toLocaleString(parsingItem.parsingDate) }}</td>
                            <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ parsingItem.rating }}</td>
                            <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ parsingItem.reviewsCount }}</td>
                            <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ parsingItem.subscribers }}</td>
                            <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ parsingItem.deliveryInfo }}</td>
                            <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ parsingItem.activeAdds }}</td>
                            <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ parsingItem.completedAdds || MessagesEnum.InfoNotFound }}</td>
                        </tr>
                    </table>
                </template>
                <template v-else>
                    <div class="text-center text-xl font-medium">Парсинги не найдены</div>
                </template>
            </div>
        </div>
    </template>
    <template v-else>
        <div class="text-center text-xl font-bold">Ничего не найдено</div>
    </template>
    <Modal v-if="editModalVisible" @close="onCloseModal">
        <div v-if="editableItem">
            <form @submit.prevent="onEditProfile(editableItem)">
                <div class="text-2xl font-bold mb-5 pr-10">{{ editableItem.name }}</div>
                <div class="mb-6">
                    <div class="mb-2 text-sm font-medium">Комментарий</div>
                    <input
                        v-model="editableItem.comment"
                        type="search"
                        required
                        class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                    >
                </div>
                <div>
                    <Button type="submit" theme="success">Сохранить</Button>
                </div>
            </form>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import Spinner from '@/components/common/Spinner.vue'
import Modal from '@/components/common/Modal.vue'
import Button from '@/components/common/Button.vue'

import { onMounted, ref, onBeforeMount } from 'vue'
import { MessagesEnum } from '@/types/enums'
import { copyToBuffer } from '@/helpers/common'
import { toLocaleString } from '@/helpers/date'
import { toast } from '@/helpers/toast'
import { IProfileItemDB, profileSavedList } from '@/reactive/useProfileSavedList'
import { reviewsFilter } from '@/reactive/useReviewsFilter'

const editModalVisible = ref<boolean>(false)

const editableItem = ref<IProfileItemDB | null>(null)

const loadingComponent = ref<boolean>(false)

function onOpenLink(profile: IProfileItemDB) {
    if (profile.url) {
        window.open(profile.url, '_blank');
    }
}

function onCopyLink(profile: IProfileItemDB) {
    if (profile.url) {
        copyToBuffer(profile.url)
        toast.show('success', MessagesEnum.ProfileLinkCopied)
    }
}

function onOpenProfileDetails(profile: IProfileItemDB) {
    profile.opened = !profile.opened
}

function onCloseModal() {
    editModalVisible.value = false
    editableItem.value = null
}

function onShowEditModal(profile: IProfileItemDB) {
    editModalVisible.value = true
    editableItem.value = profile
}

function onPushLinkToFilter(profile: IProfileItemDB) {
    reviewsFilter.profileLinkPushNew(profile.url)
    reviewsFilter.profileLinksHighlightDuplicates()
    reviewsFilter.profileLinksRemoveEmpty()
    toast.show('success', MessagesEnum.ProfileLinkAddedInReviewsFilter)
}

async function onEditProfile(profile: IProfileItemDB) {
    profileSavedList.apiProfileUpdate(profile)
    editModalVisible.value = false
    editableItem.value = null
}

async function onDeleteProfile(profile: IProfileItemDB) {
    if (window.confirm(`Удаляем "${profile.name}" ?`) && profile.id) {
        await profileSavedList.apiProfileDelete(profile)
        setTimeout(async () => {
            profileSavedList.list.value = await profileSavedList.apiGetList()
        }, 0)
    }
}

onMounted(async () => {
    setTimeout(async () => {
        profileSavedList.list.value = await profileSavedList.apiGetList()
    }, 0)
})

onBeforeMount(() => {
    profileSavedList.list.value.forEach(item => item.opened = false)
})
</script>