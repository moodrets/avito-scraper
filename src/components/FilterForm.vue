<template>
    <form class="pb-20" @submit.prevent="onSubmit">
        <div class="grid grid-cols-2 gap-5">
            <div>
                <div class="mb-2 text-sm">Ссылка на профиль</div>
                <input 
                    v-model="fields.profileLink" 
                    type="text"
                    required
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div>
                <div class="mb-2 text-sm">Название товара</div>
                <input 
                    v-model="fields.productName" 
                    type="text" 
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div>
                <div class="mb-2 text-sm">Дата от</div>
                <input 
                    v-model="fields.dateFrom"
                    required
                    autocomplete="off"
                    type="text"
                    id="dateFrom" 
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div>
                <div class="mb-2 text-sm">Дата до</div>
                <input 
                    v-model="fields.dateTo"
                    autocomplete="off"
                    required 
                    type="text" 
                    id="dateTo"
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div>
                <div class="mb-2 text-sm">Рейтинг от</div>
                <input 
                    v-model="fields.ratingFrom" 
                    type="number"
                    min="0"
                    max="5"
                    required
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div>
                <div class="mb-2 text-sm">Рейтинг до</div>
                <input 
                    v-model="fields.ratingTo" 
                    type="number"
                    min="0"
                    max="5" 
                    required
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div class="col-span-2">
                <div class="mb-2 text-sm">Интервал прокрутки отзывов (указываем в секундах)</div>
                <input 
                    v-model="fields.interval" 
                    type="number"
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div class="col-span-2 select-none">
                <label class="inline-flex items-center">
                    <div class="border border-white w-6 h-6 mr-3 flex-none">
                        <input v-model="fields.deliveryOnly" type="checkbox" class="w-full h-full">
                    </div>
                    <div class="text-base">Только с доставкой</div>
                </label>
            </div>
        </div>
        <div class="flex items-center gap-4 mt-10">
            <Button theme="success" type="submit" icon="find_in_page">Начать парсинг</Button>
            <Button @click.stop.prevent="onSaveFilter" theme="info" type="button" icon="save">Сохранить фильтр</Button>
            <Button @click.stop.prevent="onReset" theme="warning" type="button" icon="refresh">Сбросить фильтр</Button>
            <Button @click.stop.prevent="onStopSearch" theme="danger" type="button" icon="cancel" class="ml-auto">Остановить парсинг</Button>
        </div>
    </form>
</template>

<script setup lang="ts">
import AirDatepicker from 'air-datepicker';
import Button from '@/components/Button.vue'

import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { appStart } from '@/reactive/useAppState';
import { useToast } from '@/reactive/useToast';
import { loading } from '@/reactive/useAppLoader';
import { getDateYesterday } from '@/helpers/date';

const toast = useToast()

const openedTabId = ref<number>(0)

interface IFilterFields {
    profileLink: string
    productName: string
    dateFrom: string
    dateTo: string
    ratingFrom: number
    ratingTo: number
    interval: number
    deliveryOnly: boolean
}

const fields = reactive<IFilterFields>({
    profileLink: '',
    productName: '',
    dateFrom: '',
    dateTo: '',
    ratingFrom: 4,
    ratingTo: 5,
    interval: 0,
    deliveryOnly: false,
})

const datePickers: Record<string, any> = {
    dateFrom: null,
    dateTo: null,
}

const datePickersConfig: Record<string, any> = {
    autoClose: true,
    onSelect: ({formattedDate, datepicker}: any) => {
        if (datepicker.$el.id === 'dateFrom') {
            fields.dateFrom = formattedDate
        }

        if (datepicker.$el.id === 'dateTo') {
            fields.dateTo = formattedDate
        }
    }
}

watch(appStart, async () => {
    const { filterFields: filterFieldsFromStorage } = await chrome.storage.local.get('filterFields')

    if (filterFieldsFromStorage) {
        fields.profileLink = filterFieldsFromStorage['profileLink']
        fields.productName = filterFieldsFromStorage['productName']
        fields.ratingFrom = filterFieldsFromStorage['ratingFrom']
        fields.ratingTo = filterFieldsFromStorage['ratingTo']
        fields.interval = filterFieldsFromStorage['interval']
        fields.deliveryOnly = filterFieldsFromStorage['deliveryOnly']

        datePickers.dateFrom.selectDate(filterFieldsFromStorage['dateFrom'])
        datePickers.dateTo.selectDate(filterFieldsFromStorage['dateTo'])
    }
})

watch(openedTabId, async () => {
    if (openedTabId.value) {
        chrome.tabs.sendMessage(openedTabId.value, {
            action: 'parsing-start',
            filterFields: fields
        })
    }
})

async function saveFilterToLocalStorage() {
    try {
        const fieldsToStorage = {...fields}

        fieldsToStorage.dateFrom = datePickers.dateFrom.selectedDates[0].toString()
        fieldsToStorage.dateTo = datePickers.dateTo.selectedDates[0].toString()
        
        await chrome.storage.local.set({ filterFields: fieldsToStorage })
        toast?.show('success', 'Фильтр сохранен')
        
    } catch(error: any) {
        toast?.show('error', 'Не удалось сохранить фильтр')
    }
}

async function onReset() {
    fields.profileLink = '',
    fields.productName = '',
    fields.ratingFrom = 4
    fields.ratingTo = 5
    fields.interval = 0
    fields.deliveryOnly = false

    datePickers.dateFrom.selectDate(getDateYesterday()) 
    datePickers.dateTo.selectDate(new Date())

    await chrome.storage.local.remove('filterFields')
    toast?.show('warning', 'Фильтр удален c памяти')
}

async function onStopSearch() {
    loading.value = false

    if (openedTabId.value) {
        await chrome.tabs.remove(openedTabId.value)
        openedTabId.value = 0
        toast?.show('warning', 'Парсинг отзывов отменен')
    }
}

async function onSaveFilter() {
    await saveFilterToLocalStorage()
}

async function onSubmit() {

    await saveFilterToLocalStorage()

    try {
        chrome.tabs.create({url: fields.profileLink, active: false});

    } catch (error: any) {
        toast?.show('error', 'Не удалось открыть ссылку')
    }
}

function onTabsUpdate(tabid: any, info: any, tabInfo: any) {
    if (info.status === 'complete' && tabInfo.url === fields.profileLink) {
        openedTabId.value = tabid
    }
}

onMounted(() => {
    datePickers.dateFrom = new AirDatepicker('#dateFrom', datePickersConfig)
    datePickers.dateTo = new AirDatepicker('#dateTo', datePickersConfig)
    datePickers.dateFrom.selectDate(getDateYesterday())
    datePickers.dateTo.selectDate(new Date())

    chrome.tabs.onUpdated.addListener(onTabsUpdate)
})

onBeforeUnmount(()=>{
    datePickers.dateFrom.destroy()
    datePickers.dateTo.destroy()

    chrome.tabs.onUpdated.removeListener(onTabsUpdate)
})
</script>