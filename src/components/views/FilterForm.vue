<template>
    <form class="pb-20" @submit.prevent="onSubmit">
        <ProfileInfo />
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
            <Button @click.stop.prevent="onSave" theme="info" type="button" icon="save">Сохранить фильтр</Button>
            <Button @click.stop.prevent="onReset" theme="warning" type="button" icon="refresh">Сбросить фильтр</Button>
            <Button @click.stop.prevent="onStop" theme="danger" type="button" icon="cancel" class="ml-auto">Остановить парсинг</Button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import AirDatepicker from 'air-datepicker';
import Button from '@/components/common/Button.vue'
import ProfileInfo from '@/components/common/ProfileInfo.vue'

import { ToastMessagesEnum } from '@/enums/enums';
import { appStart } from '@/reactive/useAppState';
import { useToast } from '@/reactive/useToast';
import { loading } from '@/reactive/useAppLoader';
import { getDateYesterday } from '@/helpers/date';
import { createTab } from '@/helpers/common';

const toast = useToast()

const openedTab = ref<Record<string, any>>({})

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
    interval: 2,
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

async function saveFilterToLocalStorage() {
    try {
        const fieldsToStorage = {...fields}

        fieldsToStorage.dateFrom = datePickers.dateFrom.selectedDates[0].toString()
        fieldsToStorage.dateTo = datePickers.dateTo.selectedDates[0].toString()
        
        await chrome.storage.local.set({ filterFields: fieldsToStorage })
        toast?.show('success', ToastMessagesEnum.FilterSaved)
        
    } catch(error: any) {
        toast?.show('error', ToastMessagesEnum.FilterSaveError)
    }
}

async function onReset() {
    fields.profileLink = '',
    fields.productName = '',
    fields.ratingFrom = 4
    fields.ratingTo = 5
    fields.interval = 2
    fields.deliveryOnly = false

    datePickers.dateFrom.selectDate(getDateYesterday()) 
    datePickers.dateTo.selectDate(new Date())

    await chrome.storage.local.remove('filterFields')
    toast?.show('warning', ToastMessagesEnum.FilterCleared)
}

async function onStop() {
    loading.value = false

    if (openedTab.value?.id) {
        await chrome.tabs.remove(openedTab.value?.id)
        openedTab.value = {}
        toast?.show('warning', ToastMessagesEnum.ParsingCanceled)
    }
}

async function onSave() {
    await saveFilterToLocalStorage()
}

async function onSubmit() {

    await saveFilterToLocalStorage()

    try {
        const currentTab = await createTab(fields.profileLink)
        openedTab.value = currentTab

        if (currentTab.id) {
            chrome.tabs.sendMessage(currentTab.id, {
                action: 'parsing-start',
                filterFields: fields
            })
        }
    } catch (error: any) {
        toast?.show('error', ToastMessagesEnum.TabOpenError)
    }
}

onMounted(() => {
    datePickers.dateFrom = new AirDatepicker('#dateFrom', datePickersConfig)
    datePickers.dateTo = new AirDatepicker('#dateTo', datePickersConfig)
    datePickers.dateFrom.selectDate(getDateYesterday())
    datePickers.dateTo.selectDate(new Date())
})

onBeforeUnmount(()=>{
    datePickers.dateFrom.destroy()
    datePickers.dateTo.destroy()
})
</script>