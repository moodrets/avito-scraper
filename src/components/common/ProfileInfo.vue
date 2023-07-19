<template>
    <div v-if="Object.keys(profileInfo).length" class="rounded-lg bg-gray-600 p-5 shadow-xl mb-8 text-[16px]">
        <div class="space-y-2">
            <div class="flex items-center">
                <div class="mr-3 opacity-80">Имя:</div>
                <div class="font-bold">{{ profileInfo.name }}</div>
            </div>
            <div class="flex items-center">
                <div class="mr-3 opacity-80">Рейтинг:</div>
                <div class="font-bold">{{ profileInfo.rating }}</div>
            </div>
            <div class="flex items-center">
                <div class="mr-3 opacity-80">Отзывы:</div>
                <div class="font-bold">{{ profileInfo.reviewsCount }}</div>
            </div>
            <div class="flex items-center">
                <div class="mr-3 opacity-80">Подписки:</div>
                <div class="font-bold">{{ profileInfo.subscribers }}</div>
            </div>
            <div class="flex items-center">
                <div class="mr-3 opacity-80">Продаж с доставкой:</div>
                <div class="font-bold">{{ profileInfo.deliveryInfo }}</div>
            </div>
            <div class="flex items-center">
                <div class="mr-3 opacity-80">Дата:</div>
                <div class="font-bold">{{ profileInfo.formattedDate }}</div>
            </div>
            <div class="flex items-center">
                <div class="mr-3 opacity-80">Найден в базе:</div>
                <div class="font-bold">
                    <strong :class="[profileInfo.existsInDataBase ? 'text-green-400' : 'text-red-400']">{{ profileInfo.existsInDataBase ? 'Да' : 'Нет' }}</strong>
                </div>
            </div>
        </div>
        <div class="flex items-center gap-4 mt-5">
            <Button type="button" icon="save" @click.prevent="onSave">Сохранить в базу</Button>
            <Button theme="danger" type="button" icon="cancel" @click.prevent="onClear">Очистить базу профилей</Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import Button from '@/components/common/Button.vue'
import { ToastMessagesEnum } from '@/enums/enums';
import { profileInfo } from '@/reactive/useProfileInfo';
import { useToast } from '@/reactive/useToast';
import { watch } from 'vue';

const toast = useToast()

watch(profileInfo, async () => {
    const { profileList } = await chrome.storage.local.get('profileList')

    if (profileList) {

        const foundProfile = profileList.find((item: any) => item.url === profileInfo.value.url)

        if (foundProfile) {
            profileInfo.value.existsInDataBase = true
        }
    }
})

async function onClear() {
    await chrome.storage.local.remove('profileList')
    profileInfo.value.existsInDataBase = false
}

async function onSave() {

    let currentProfileParsingData: any = null;
    let profileListToStorage: any = []

    currentProfileParsingData = {
        date: profileInfo.value.date,
        formattedDate: profileInfo.value.formattedDate,
        rating: profileInfo.value.rating,
        reviewsCount: profileInfo.value.rating,
        deliveryInfo: profileInfo.value.deliveryInfo,
        subscribers: profileInfo.value.subscribers
    }

    const { profileList } = await chrome.storage.local.get('profileList')

    if (profileList) {
        profileListToStorage = [...profileList]
    }

    const foundProfile = profileListToStorage.find((item: any) => item.url === profileInfo.value.url)

    if (foundProfile) {

        foundProfile.parsingHistory.unshift(currentProfileParsingData)

    } else {

        profileListToStorage.push({
            id: Date.now(),
            name: profileInfo.value.name,
            url: profileInfo.value.url,
            parsingHistory: [currentProfileParsingData]
        })
    }

    await chrome.storage.local.set({'profileList': profileListToStorage})

    toast?.show('success', ToastMessagesEnum.ProfileAddedInDB)

    profileInfo.value.existsInDataBase = true
}
</script>