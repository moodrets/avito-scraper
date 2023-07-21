<template>
    <form class="pb-20" @submit.prevent="onSubmit">
        <ProfileInfo />
        <div class="grid grid-cols-4 gap-5">
            <div class="col-span-2">
                <div class="mb-2 text-sm font-medium">Ссылка на профиль</div>
                <input 
                    v-model="fields.profileLink"
                    tabindex="1"
                    type="text"
                    required
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div class="col-span-2">
                <div class="mb-2 text-sm font-medium">Название товара</div>
                <input 
                    v-model="fields.productName"
                    tabindex="9"
                    type="text" 
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div>
                <div class="mb-2 text-sm font-medium">Дата от</div>
                <input 
                    v-model="fields.dateFrom"
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
                    v-model="fields.dateTo"
                    tabindex="3"
                    autocomplete="off"
                    required 
                    type="text" 
                    id="dateTo"
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div class="col-span-2">
                <div class="mb-2 text-sm font-medium">Интервал прокрутки отзывов (указываем в секундах)</div>
                <input 
                    v-model="fields.interval"
                    tabindex="10"
                    type="number"
                    min="0"
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div>
                <div class="mb-2 text-sm font-medium">Рейтинг от</div>
                <input 
                    v-model="fields.ratingFrom"
                    tabindex="4"
                    type="number"
                    min="0"
                    max="5"
                    required
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div>
                <div class="mb-2 text-sm font-medium">Рейтинг до</div>
                <input 
                    v-model="fields.ratingTo"
                    tabindex="5"
                    type="number"
                    min="0"
                    max="5" 
                    required
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div class="col-span-4 select-none">
                <label class="inline-block">
                    <div class="mb-3 text-sm font-medium">Только с доставкой</div>
                    <Switch :tabindex="6" v-model="fields.deliveryOnly"></Switch>
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
            <Button
                tabindex="12"
                theme="danger" 
                type="button" 
                icon="cancel"
                @click.stop.prevent="onStop"
            >Остановить парсинг</Button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import AirDatepicker from 'air-datepicker';
import Button from '@/components/common/Button.vue'
import Switch from '@/components/common/Switch.vue'
import ProfileInfo from '@/components/common/ProfileInfo.vue'

import { appStart } from '@/reactive/useAppState';
import { useToast } from '@/reactive/useToast';
import { loading } from '@/reactive/useAppLoader';
import { getDateYesterday } from '@/helpers/date';
import { createTab } from '@/helpers/common';
import { MessagesEnum } from '@/types/enums';
import { IFilterFields } from '@/types/infterfaces';
import { apiGetFilter, apiRemoveFilter } from '@/api/Filter';
import { apiCreateFilter } from '@/api/Filter';

const toast = useToast()

const openedTab = ref<Record<string, any>>({})

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

    const filterFieldsStorage = await apiGetFilter()

    if (filterFieldsStorage) {
        fields.profileLink = filterFieldsStorage['profileLink']
        fields.productName = filterFieldsStorage['productName']
        fields.ratingFrom = filterFieldsStorage['ratingFrom']
        fields.ratingTo = filterFieldsStorage['ratingTo']
        fields.interval = filterFieldsStorage['interval']
        fields.deliveryOnly = filterFieldsStorage['deliveryOnly']

        datePickers.dateFrom.selectDate(filterFieldsStorage['dateFrom'])
        datePickers.dateTo.selectDate(filterFieldsStorage['dateTo'])
    }
})

async function saveFilterToLocalStorage() {
    try {
        const fieldsToStorage = {...fields}

        fieldsToStorage.dateFrom = datePickers.dateFrom.selectedDates[0].toString()
        fieldsToStorage.dateTo = datePickers.dateTo.selectedDates[0].toString()

        await apiCreateFilter(fieldsToStorage)
        
        toast?.show('success', MessagesEnum.FilterSaved)
        
    } catch(error: any) {
        toast?.show('error', MessagesEnum.FilterSaveError)
    }
}

async function onReset() {
    if (window.confirm('Сбросить фильтр ?')) {
        fields.profileLink = '',
        fields.productName = '',
        fields.ratingFrom = 4
        fields.ratingTo = 5
        fields.interval = 2
        fields.deliveryOnly = false

        datePickers.dateFrom.selectDate(getDateYesterday()) 
        datePickers.dateTo.selectDate(new Date())

        await apiRemoveFilter()
        toast?.show('warning', MessagesEnum.FilterCleared)
    }
}

async function onStop() {
    if (window.confirm('Остановить парсинг ?')) {
        loading.value = false

        if (openedTab.value?.id) {
            await chrome.tabs.remove(openedTab.value.id)
            openedTab.value = {}
            toast?.show('warning', MessagesEnum.ParsingCanceled)
        }
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
                action: 'reviews-parsing-start',
                filterFields: fields
            })
        }
    } catch (error: any) {
        toast?.show('error', MessagesEnum.TabOpenError)
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