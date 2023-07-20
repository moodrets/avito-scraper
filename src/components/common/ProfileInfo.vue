<template>
    <div v-if="profileInfo" class="rounded-lg bg-gray-600 p-5 shadow-xl mb-8 text-[16px]">
        <div class="space-y-2">
            <div v-if="profileInfo.id" class="flex items-center">
                <div class="mr-3 opacity-80">ID:</div>
                <div class="font-bold">{{ profileInfo.id }}</div>
            </div>
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
                <div class="mr-3 opacity-80">{{ profileInfo.existsInDataBase ? 'Дата сохранения:' : 'Дата' }}</div>
                <div class="font-bold">{{ profileInfo.createdDateFormatted }}</div>
            </div>
            <div class="flex items-center">
                <div class="mr-3 opacity-80">Найден в базе:</div>
                <div class="font-bold">
                    <strong :class="[profileInfo.existsInDataBase ? 'text-green-400' : 'text-red-400']">{{ profileInfo.existsInDataBase ? 'Да' : 'Нет' }}</strong>
                </div>
            </div>
        </div>
        <div v-if="!profileInfo.existsInDataBase" class="flex items-center gap-4 mt-5">
            <Button type="button" icon="save" @click.prevent="onSave">Сохранить в базу</Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import Button from '@/components/common/Button.vue'
import { MessagesEnum } from '@/types/enums';
import { profileInfo } from '@/reactive/useProfileInfo';
import { useToast } from '@/reactive/useToast';
import { watch } from 'vue';
import { apiCreateProfile, apiGetProfileByUrl } from '@/api/Profiles';

const toast = useToast()

const profileInfoWatcher = watch(profileInfo, async () => {
    if (profileInfo.value?.url) {

        const foundProfile = await apiGetProfileByUrl(profileInfo.value?.url)

        if (foundProfile) {
            foundProfile.existsInDataBase = true
            profileInfo.value = foundProfile
            profileInfoWatcher()
        }
    }
})

async function onSave() {
    if (profileInfo.value) {

        try {

            const newProfile = await apiCreateProfile(profileInfo.value)

            toast?.show('success', MessagesEnum.ProfileCreated)

            profileInfo.value.id = newProfile.id
            profileInfo.value.existsInDataBase = true
            profileInfo.value.createdDateFormatted = newProfile.createdDateFormatted

        } catch(error: any) {

        } finally {

        }
    }
}
</script>