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
            class="rounded-lg  px-5 py-3 shadow-xl mb-2 cursor-pointer"
            :class="profile.opened ? 'bg-zinc-600' : 'bg-gray-600'"
            @click="profile.opened = !profile.opened"
        >
            <div class="flex gap-4">
                <div class="text-2xl flex-1 min-w-0">{{ profile.name }}</div>
                <div class="flex-none" @click.stop="onDeleteProfile(profile)">
                    <i class="font-icon text-3xl text-red-400">cancel</i>
                </div>
                <div class="flex-none" @click.stop="onOpenLink(profile)">
                    <i class="font-icon text-3xl text-green-500">open_in_new</i>
                </div>
                <div class="flex-none" @click.stop="onCopyLink(profile)">
                    <i class="font-icon text-3xl text-sky-500">content_copy</i>
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
                    <tr v-for="history in profile.parsingHistory">
                        <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ history.formattedDate }}</td>
                        <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ history.rating }}</td>
                        <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ history.reviewsCount }}</td>
                        <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ history.subscribers }}</td>
                        <td class="text-left px-4 py-2 border border-white border-opacity-50">{{ history.deliveryInfo }}</td>
                    </tr>
                </table>
            </div>
        </div>
    </template>
    <template v-else>
        <div class="text-center text-2xl font-bold">Ничего нет</div>
    </template>
</template>

<script setup lang="ts">
import Spinner from '@/components/common/Spinner.vue'
import { useToast } from '@/reactive/useToast';
import { onMounted, reactive, ref } from 'vue';

const toast = useToast()

const loadingComponent = ref<boolean>(false)

const profileDataList = reactive<any[]>([])

async function onDeleteProfile(profile: any) {
    if (window.confirm(`Удаляем "${profile.name}" ?`)) {

    }
}

function onOpenLink(profile: any) {
    if (profile.url) {
        window.open(profile.url, '_blank');
    }
}

function onCopyLink(profile: any) {
    console.log(profile.url);
    toast?.show('success', 'Ссылка профиля скопированна в буффер')
}

onMounted(async () => {
    try {

        loadingComponent.value = true

        const { profileList } = await chrome.storage.local.get('profileList')

        if (profileList) {
            const convertedList = profileList.map((item: any) => ({...item, opened: false}))

            profileDataList.push(...convertedList)
        }

    } catch(error: any) {

    } finally {
        loadingComponent.value = false
    }
})
</script>