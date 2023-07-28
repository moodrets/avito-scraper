<template>
    <template v-if="loadingComponent">
        <div class="flex justify-center">
            <Spinner class="w-10 h-10 flex-none"></Spinner>
        </div>
    </template>
    <template v-else-if="profileSavedList.length">
        <div
            v-for="profile in profileSavedList"
            :key="profile.id"
            :class="profile.opened ? 'ring ring-blue-400' : ''"
            class="rounded-lg bg-gray-600 shadow-xl mb-3"
        >
            <div
                class="flex items-start p-4 select-none cursor-pointer" 
                @click="onOpenProfileDetails(profile)"
            >
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="text-xl font-medium">{{ profile.name }}</div>
                        <div v-if="profile.comment" class="text-[16px] text-sky-300 font-medium">{{ profile.comment }}</div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="text-[16px] text-orange-300 font-medium">{{ getLastParsingInfo(profile)?.rating }}</div>
                        <div class="text-[16px] text-yellow-300 font-medium">{{ getLastParsingInfo(profile)?.reviewsCount }}</div>
                        <div class="text-[16px] text-teal-300 font-medium">{{ getLastParsingInfo(profile)?.subscribers }}</div>
                        <div class="text-[16px] text-gray-300 font-medium">{{ getLastParsingInfo(profile)?.parsingDate ? toLocaleString(getLastParsingInfo(profile)?.parsingDate) : '' }}</div>
                    </div>
                </div>
                <div class="flex-none flex items-center gap-4">
                    <!-- <div class="flex-none ml-auto" @click.stop="onOpenLink(profile)">
                        <i class="font-icon text-3xl text-green-500">open_in_new</i>
                    </div> -->
                    <div class="flex-none ml-auto" @click.stop="onShowEditModal(profile)">
                        <i class="font-icon text-3xl text-green-500">edit</i>
                    </div>
                    <div class="flex-none" @click.stop="onCopyLink(profile)">
                        <i class="font-icon text-3xl text-sky-500">content_copy</i>
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
                        </tr>
                        <tr v-for="parsingItem in profile.parsingResults">
                            <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ toLocaleString(parsingItem.parsingDate) }}</td>
                            <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ parsingItem.rating }}</td>
                            <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ parsingItem.reviewsCount }}</td>
                            <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ parsingItem.subscribers }}</td>
                            <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ parsingItem.deliveryInfo }}</td>
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
            <div class="text-2xl font-bold mb-5">{{ editableItem.name }}</div>
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
                <Button 
                    type="submit" 
                    theme="success" 
                    @click.stop.prevent="onEditProfile(editableItem.id, editableItem)"
                >Сохранить</Button>
            </div>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Spinner from '@/components/common/Spinner.vue'
import Modal from '@/components/common/Modal.vue'
import Button from '@/components/common/Button.vue'
import { MessagesEnum } from '@/types/enums'
import { useToast } from '@/reactive/useToast'
import { copyToBuffer } from '@/helpers/common'
import { toLocaleString } from '@/helpers/date'
import { IProfileItemDBExt, profileSavedList } from '@/reactive/useProfileList'
import { apiProfileDelete, apiProfileGetList, apiProfileUpdate } from '@/api/Profiles'
import { IParsingResultItem } from '@/reactive/useParsingResults'

const toast = useToast()

const editModalVisible = ref<boolean>(false)

const editableItem = ref<IProfileItemDBExt | null>(null)

const loadingComponent = ref<boolean>(false)

function getLastParsingInfo(profile: IProfileItemDBExt): IParsingResultItem | null {
    const result = profile.parsingResults[0]
    return result || null
}

function onOpenLink(profile: IProfileItemDBExt) {
    if (profile.url) {
        window.open(profile.url, '_blank');
    }
}

function onCopyLink(profile: IProfileItemDBExt) {
    if (profile.url) {
        copyToBuffer(profile.url)
        toast?.show('success', MessagesEnum.ProfileLinkCopied)
    }
}

function onOpenProfileDetails(profile: IProfileItemDBExt) {
    profile.opened = !profile.opened
}

function onCloseModal() {
    editModalVisible.value = false
    editableItem.value = null
}

function onShowEditModal(profile: IProfileItemDBExt) {
    editModalVisible.value = true
    editableItem.value = profile
}

async function onEditProfile(id: number | undefined, profile: IProfileItemDBExt) {
    if (!id) return

    try {
        const result = await apiProfileUpdate(id, profile)
        if (result) {
            toast?.show('success', MessagesEnum.ProfileEdited)
            editableItem.value = null
            editModalVisible.value = false
        } else {
            throw new Error()
        }

    } catch(error: any) {
        toast?.show('error', MessagesEnum.ProfileEditeError)
    } finally {

    }
}

async function onDeleteProfile(profile: IProfileItemDBExt) {
    if (window.confirm(`Удаляем "${profile.name}" ?`) && profile.id) {
        try {
            await apiProfileDelete(profile.id)
            toast?.show('success', MessagesEnum.ProfileDeleted)
            getProfileList()
        } catch(error: any) {
            console.log(error);
            toast?.show('error', MessagesEnum.ProfileDeleteError)
        } finally {

        }
    }
}

async function getProfileList() {
    try {
        loadingComponent.value = true

        const resultList = await apiProfileGetList(0, 0)

        profileSavedList.value = resultList.map(item => ({
            ...item,
            opened: false,
            loading: false
        }))

    } catch(error: any) {

    } finally {
        loadingComponent.value = false
    }
}

onMounted(async () => {
    setTimeout(()=>{
        getProfileList()
    }, 0)
})
</script>