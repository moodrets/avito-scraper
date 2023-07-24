<template>
    <div v-if="profileInfo" class="rounded-xl shadow-xl bg-gray-600 p-5 mb-8 text-[16px]">
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
                <div class="mr-3 opacity-80">Дата парсинга:</div>
                <div class="font-bold">{{ toLocaleString(profileInfo.parsingDate) }}</div>
            </div>
            <div class="flex items-center" v-if="profileInfo.savedDate">
                <div class="mr-3 opacity-80">Дата сохранения:</div>
                <div class="font-bold">{{ toLocaleString(profileInfo.savedDate) }}</div>
            </div>
            <div class="flex items-center">
                <div class="mr-3 opacity-80">Найден в базе:</div>
                <div class="font-bold">
                    <strong 
                        :class="[profileInfo.existsInDataBase ? 'text-green-400' : 'text-red-400']"
                    >{{ profileInfo.existsInDataBase ? 'Да' : 'Нет' }}</strong>
                </div>
            </div>
        </div>
        <div class="flex items-center gap-4 mt-5 empty:hidden">
            <Button 
                v-if="!profileInfo.existsInDataBase"
                type="button" 
                icon="cloud_upload" 
                @click.prevent="onSave"
            >Сохранить в базу</Button>
            <Button 
                v-if="reviewsList.length" 
                type="button" 
                theme="success" 
                icon="content_copy" 
                @click.prevent="onCopy"
            >Копировать отзывы</Button>
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
import { reviewsList } from '@/reactive/useReviewsList';
import { copyToBuffer } from '@/helpers/common';
import { toLocaleString } from '@/helpers/date';
import { apiCreateParsingResult } from '@/api/ParsingResults';

const toast = useToast()

const profileInfoWatcher = watch(profileInfo, async () => {
    if (!profileInfo.value?.id && profileInfo.value?.url) {

        const foundProfile = await apiGetProfileByUrl(profileInfo.value.url)

        if (foundProfile) {
            profileInfo.value.existsInDataBase = true
            profileInfo.value.savedDate = foundProfile.savedDate
            profileInfo.value.id = foundProfile.id
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
            profileInfo.value.savedDate = newProfile.savedDate

            if (reviewsList.value.length) {
                await apiCreateParsingResult(profileInfo.value)
            }

        } catch(error: any) {

        } finally {

        }
    }
}

function onCopy() {
    let textValue: string = ''

    if (profileInfo.value) {
        textValue+= `Имя: ${profileInfo.value.name}\n`
        textValue+= `Дата парсинга: ${toLocaleString(profileInfo.value.parsingDate)}\n`
        textValue+= `Ссылка: ${profileInfo.value.url}\n`
        textValue+= `Рейтинг: ${profileInfo.value.rating}\n`
        textValue+= `Отзывы: ${profileInfo.value.reviewsCount}\n`
        textValue+= `Подписки: ${profileInfo.value.subscribers}\n`
        textValue+= `Продаж с доставкой: ${profileInfo.value.deliveryInfo}\n\n\n\n`
    }

    if (reviewsList.value.length) {
        reviewsList.value.forEach(item => {
            let date = new Date(item.date)
            // let day = new Intl.DateTimeFormat('ru', { day: '2-digit' }).format(date)
            let month = new Intl.DateTimeFormat('ru', { month: '2-digit' }).format(date)
            let year = new Intl.DateTimeFormat('ru', { year: 'numeric' }).format(date)
            textValue += `${item.productName}~${month}.${year}${item.delivery ? '~Delivery' : ''}\n`
        })
    }

    if (textValue) {
        copyToBuffer(textValue)
        toast?.show('success', MessagesEnum.InfoCopied)
    }
}
</script>