<template>
    <form class="pb-20" @submit.prevent="onParsingStart">
        <div class="grid grid-cols-4 gap-5">
            <div class="col-span-4">
                <div class="text-sm font-medium mb-2">Ссылки на профили</div>
                <div
                    v-for="link, index in reviewsFilterFields.profilesLinks" 
                    :key="index" 
                    class="flex items-center gap-4"
                    :class="index > 0 ? 'mt-5' : ''"
                >
                    <div class="flex-none select-none">
                        <i v-if="link.status === 'success'" class="font-icon text-3xl block text-green-400">check_circle</i>
                        <i v-if="link.status === 'error'" class="font-icon text-3xl block text-red-400">cancel</i>
                        <i v-if="link.status === 'wait'" class="font-icon text-3xl block text-green-400 animate-spin">rotate_right</i>
                        <i v-if="link.status === 'new'" class="font-icon text-3xl block text-gray-400">watch_later</i>
                    </div>
                    <input
                        v-model="link.url"
                        tabindex="1"
                        type="search"
                        required
                        class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                    >
                    <div v-if="reviewsFilterFields.profilesLinks.length > 1" class="flex-none cursor-pointer select-none">
                        <i class="font-icon text-3xl block text-red-400" @click="reviewsFilterRemoveProfileLink(index)">remove_circle_outline</i>
                    </div>
                    <div class="flex-none cursor-pointer select-none ml-auto">
                        <i class="font-icon text-3xl block text-green-400" @click="reviewsFilterAddProfileLink">add_circle_outline</i>
                    </div>
                </div>
            </div>
            <div>
                <div class="mb-2 text-sm font-medium">Дата от</div>
                <input 
                    v-model="reviewsFilterFields.dateFrom"
                    tabindex="2"
                    required
                    autocomplete="off"
                    type="text"
                    id="dateFrom" 
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div>
                <div class="mb-2 text-sm font-medium">Дата до</div>
                <input 
                    v-model="reviewsFilterFields.dateTo"
                    tabindex="3"
                    autocomplete="off"
                    required 
                    type="text" 
                    id="dateTo"
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div class="col-span-2">
                <div class="mb-2 text-sm font-medium">Название товара</div>
                <input 
                    v-model="reviewsFilterFields.productName"
                    tabindex="9"
                    type="search" 
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            
            <div>
                <div class="mb-2 text-sm font-medium">Рейтинг от</div>
                <input 
                    v-model="reviewsFilterFields.ratingFrom"
                    tabindex="4"
                    type="number"
                    min="1"
                    max="5"
                    required
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div>
                <div class="mb-2 text-sm font-medium">Рейтинг до</div>
                <input 
                    v-model="reviewsFilterFields.ratingTo"
                    tabindex="5"
                    type="number"
                    min="1"
                    max="5" 
                    required
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div class="col-span-2">
                <div class="mb-2 text-sm font-medium">Интервал прокрутки отзывов (указываем в секундах)</div>
                <input 
                    v-model="reviewsFilterFields.interval"
                    tabindex="10"
                    type="number"
                    min="0"
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div class="col-span-4 select-none">
                <label class="inline-block">
                    <div class="mb-3 text-sm font-medium">Только с доставкой</div>
                    <Switch :tabindex="6" v-model="reviewsFilterFields.deliveryOnly"></Switch>
                </label>
            </div>
        </div>
        <div class="flex items-center gap-4 mt-10">
            <Button 
                tabindex="7"
                theme="success" 
                type="submit"
                icon="find_in_page"
            >Начать парсинг</Button>
            <Button
                tabindex="8"
                theme="info" 
                type="button" 
                icon="save"
                @click.stop.prevent="onSave" 
            >Сохранить фильтр</Button>
            <Button 
                tabindex="11"
                theme="warning" 
                type="button" 
                icon="restore" 
                @click.stop.prevent="onReset"
            >Сбросить фильтр</Button>
            <!-- <Button
                tabindex="12"
                theme="danger" 
                type="button" 
                icon="cancel"
                @click.stop.prevent="onStop"
            >Остановить парсинг</Button> -->
        </div>
    </form>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, toRaw } from 'vue';
import AirDatepicker from 'air-datepicker';
import Button from '@/components/common/Button.vue'
import Switch from '@/components/common/Switch.vue'

import { useToast } from '@/reactive/useToast';
import { getDateTwoMonthAgo } from '@/helpers/date';
import { createTab } from '@/helpers/common';
import { MessagesEnum } from '@/types/enums';
import {
    apiReviewsCreateFilter,
    apiReviewsGetFilter,
    apiReviewsRemoveFilter,
    reviewsFilterFields,
    reviewsFilterFindNewLink,
    reviewsFilterAddProfileLink,
    reviewsFilterRemoveProfileLink
} from '@/reactive/useReviewsFilter';

const toast = useToast()

const openedTab = ref<Record<string, any>>({})

const datePickers: Record<string, any> = {
    dateFrom: null,
    dateTo: null,
}

const datePickersConfig: Record<string, any> = {
    autoClose: true,
    onSelect: ({formattedDate, datepicker}: any) => {
        if (datepicker.$el.id === 'dateFrom') {
            reviewsFilterFields.dateFrom = formattedDate
        }

        if (datepicker.$el.id === 'dateTo') {
            reviewsFilterFields.dateTo = formattedDate
        }
    }
}

async function setFilterFromStorage() {
    const filterFieldsStorage = await apiReviewsGetFilter()

    if (filterFieldsStorage) {
        reviewsFilterFields.profilesLinks = Object.values(filterFieldsStorage['profilesLinks'])
        reviewsFilterFields.productName = filterFieldsStorage['productName']
        reviewsFilterFields.ratingFrom = filterFieldsStorage['ratingFrom']
        reviewsFilterFields.ratingTo = filterFieldsStorage['ratingTo']
        reviewsFilterFields.interval = filterFieldsStorage['interval']
        reviewsFilterFields.deliveryOnly = filterFieldsStorage['deliveryOnly']

        datePickers.dateFrom.selectDate(filterFieldsStorage['dateFrom'])
        datePickers.dateTo.selectDate(filterFieldsStorage['dateTo'])
    }
}

async function onReset() {
    if (window.confirm('Сбросить фильтр ?')) {
        reviewsFilterFields.profilesLinks = [{
            url: '',
            status: 'new'
        }]
        reviewsFilterFields.productName = '',
        reviewsFilterFields.ratingFrom = 4
        reviewsFilterFields.ratingTo = 5
        reviewsFilterFields.interval = 2
        reviewsFilterFields.deliveryOnly = false

        datePickers.dateFrom.selectDate(getDateTwoMonthAgo()) 
        datePickers.dateTo.selectDate(new Date())

        await apiReviewsRemoveFilter()
        toast?.show('warning', MessagesEnum.FilterCleared)
    }
}

// async function onStop() {
//     if (window.confirm('Остановить парсинг ?')) {
//         loading.value = false

//         if (openedTab.value?.id) {
//             await chrome.tabs.remove(openedTab.value.id)
//             openedTab.value = {}
//             toast?.show('warning', MessagesEnum.ParsingCanceled)
//         }
//     }
// }

async function saveFilter() {
    try {
        const fieldsToStorage = {...reviewsFilterFields}

        fieldsToStorage.dateFrom = datePickers.dateFrom.selectedDates[0].toString()
        fieldsToStorage.dateTo = datePickers.dateTo.selectedDates[0].toString()
        fieldsToStorage.profilesLinks.forEach(item => item.status = 'new')

        await apiReviewsCreateFilter(fieldsToStorage)
        
        toast?.show('success', MessagesEnum.FilterSaved)
        
    } catch(error: any) {
        toast?.show('error', MessagesEnum.FilterSaveError)
    }
}

async function onSave() {
    await saveFilter()
}

async function onParsingStart(){
    await saveFilter()
    await onSubmit()
}

async function onSubmit() {

    try {
        const profileNewLink = reviewsFilterFindNewLink()

        if (profileNewLink) {
            const currentTab = await createTab(profileNewLink?.url)
            openedTab.value = currentTab

            if (currentTab.id) {
                chrome.tabs.sendMessage(currentTab.id, {
                    action: 'reviews-parsing-start',
                    filterFields: reviewsFilterFields,
                    currentUrl: profileNewLink.url
                })
            }
        }
        
    } catch (error: any) {
        toast?.show('error', MessagesEnum.TabOpenError)
    }
}

defineExpose({
    onSubmit
})

onMounted(() => {
    datePickers.dateFrom = new AirDatepicker('#dateFrom', datePickersConfig)
    datePickers.dateTo = new AirDatepicker('#dateTo', datePickersConfig)
    datePickers.dateFrom.selectDate(getDateTwoMonthAgo())
    datePickers.dateTo.selectDate(new Date())
    setFilterFromStorage()
})

onBeforeUnmount(()=>{
    datePickers.dateFrom.destroy()
    datePickers.dateTo.destroy()
})
</script>