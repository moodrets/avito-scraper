<template>
    <template v-if="profileInfoList.length">
        <div 
            v-for="profile in profileInfoList" 
            :key="profile.url" 
            class="rounded-xl shadow-xl bg-gray-600 p-5 mb-5 text-[16px]"
        >
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
                    <div v-if="profile.id" class="flex items-center">
                        <div class="mr-3 opacity-80">ID:</div>
                        <div class="font-bold">{{ profile.id }}</div>
                    </div>
                    <div class="flex items-center">
                        <div class="mr-3 opacity-80">Найден в базе:</div>
                        <div class="font-bold">
                            <strong 
                                :class="[profile.existsInDataBase ? 'text-green-400' : 'text-red-400']"
                            >{{ profile.existsInDataBase ? 'Да' : 'Нет' }}</strong>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="flex items-center gap-4 mt-5 empty:hidden">
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
                    </div>
                </div>
            </div>
            
            <!-- reviews list -->
            <div v-if="profile.reviewsList?.length" class="mt-10">
                <div class="mb-8 font-bold text-xl">
                    <div>Найдено отзывов - <strong>{{ profile.reviewsList.length }}</strong></div>
                </div>
                <table class="w-full relative">
                    <tr class="text-[16px] sticky top-[70px] bg-gray-600">
                        <th class="text-left px-4 py-2 border border-white border-opacity-50">Дата</th>
                        <th class="text-left px-4 py-2 border border-white border-opacity-50">Оценка</th>
                        <th class="text-left px-4 py-2 border border-white border-opacity-50">Название товара</th>
                        <th class="text-left px-4 py-2 border border-white border-opacity-50">Доставка</th>
                    </tr>
                    <tr v-for="item, index in profile.reviewsList" :key="index" class="text-[14px] hover:bg-gray-600">
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
            <template v-else>
                <div class="text-center text-xl font-bold mt-10">Отзывов не найдено</div>
            </template>

        </div>
    </template>
    <div v-else class="text-center text-xl font-bold">Ничего не найдено</div>
</template>

<script lang="ts" setup>
import Button from '@/components/common/Button.vue'
import { copyToBuffer } from '@/helpers/common';
import { toLocaleString } from '@/helpers/date'
import { apiParsingResultsCreate } from '@/reactive/useParsingResults';
import { findProfileInDB } from '@/reactive/useProfileList';
import { IProfileItem, apiProfileCreate, profileInfoList } from '@/reactive/useProfileList'
import { getReviewsListByUrl } from '@/reactive/useReviewsItems'
import { useToast } from '@/reactive/useToast';
import { MessagesEnum } from '@/types/enums';
import { onMounted } from 'vue';

const toast = useToast()

async function onSave(profile: IProfileItem) {
    try {

        const newProfile = await apiProfileCreate(profile)

        toast?.show('success', MessagesEnum.ProfileCreated)

        profile.id = newProfile.id
        profile.existsInDataBase = true
        profile.savedDate = newProfile.savedDate

        if (profile.reviewsList?.length) {
            await apiParsingResultsCreate(profile)
        }

    } catch(error: any) {

    } finally {

    }
}

async function onCopy(profile: IProfileItem) {
    let textValue: string = ''

    textValue+= `${profile.name}\n`
    textValue+= `${profile.url}\n`
    textValue+= `${profile.rating}\n`
    textValue+= `${profile.reviewsCount}\n`
    textValue+= `${profile.subscribers}\n`
    textValue+= `${profile.deliveryInfo}\n\n\n\n`
    textValue+= `${toLocaleString(profile.parsingDate)}\n`

    profile.reviewsList?.forEach(item => {
        let date = new Date(item.date)
        // let day = new Intl.DateTimeFormat('ru', { day: '2-digit' }).format(date)
        let month = new Intl.DateTimeFormat('ru', { month: '2-digit' }).format(date)
        let year = new Intl.DateTimeFormat('ru', { year: 'numeric' }).format(date)
        textValue += `${item.productName}~${month}.${year}${item.delivery ? '~Delivery' : ''}\n`
    })

    if (textValue) {
        copyToBuffer(textValue)
        toast?.show('success', MessagesEnum.InfoCopied)
    }
}

function onCopyProductName(productName: string) {
    copyToBuffer(productName)
    toast?.show('success', MessagesEnum.ProductNameCopied)
}

onMounted(() => {
    profileInfoList.value.forEach(async profile => {
        profile.reviewsList = getReviewsListByUrl(profile.url)
        const findInDB = await findProfileInDB(profile)
        if (findInDB) {
            profile.existsInDataBase = true
            profile.id = findInDB.id
        }
    })
})
</script>