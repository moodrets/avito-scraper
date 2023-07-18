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
            <Button theme="success" type="submit" icon="search">Начать поиск</Button>
            <Button @click.stop.prevent="onReset" theme="warning" type="button" icon="refresh">Сбросить фильтр</Button>
            <Button @click.stop.prevent="onStopSearch" theme="danger" type="button" icon="cancel" class="ml-auto">Остановить поиск</Button>
        </div>
    </form>
</template>

<script setup lang="ts">
import AirDatepicker from 'air-datepicker';
import Button from '@/components/Button.vue'
import { onBeforeMount, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { appStart } from '@/reactive/useAppState';
import { useToast } from '@/reactive/useToast';

const toast = useToast()

const openedTabId = ref<number>(0)

const getDateYesterday = () => {
    let date: any = new Date()
    return date.setDate(date.getDate() - 1)
}

const fields = reactive<any>({
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
    const { filterFields } = await chrome.storage.local.get('filterFields')

    if (filterFields) {
        fields.profileLink = filterFields['profileLink']
        fields.productName = filterFields['productName']
        fields.ratingFrom = filterFields['ratingFrom']
        fields.ratingTo = filterFields['ratingTo']
        fields.interval = filterFields['interval']
        fields.deliveryOnly = filterFields['deliveryOnly']

        datePickers.dateFrom.selectDate(filterFields['dateFrom'])
        datePickers.dateTo.selectDate(filterFields['dateTo'])
    }
})

watch(openedTabId, async () => {
    chrome.tabs.sendMessage(openedTabId.value, {action: 'parsing-start'});
})

const onReset = async () => {
    fields.profileLink = '',
    fields.productName = '',
    fields.ratingFrom = 4
    fields.ratingTo = 5
    fields.interval = 0
    fields.deliveryOnly = false

    datePickers.dateFrom.selectDate(getDateYesterday()) 
    datePickers.dateTo.selectDate(new Date())

    await chrome.storage.local.remove('filterFields')
    toast?.show('warning', 'Фильтр удален с памяти')
}

const onStopSearch = async () => {

}

const onTabsUpdate = (tabid: any, info: any, tabInfo: any) => {
    if (info.status === 'complete' && tabInfo.url === fields.profileLink) {
        openedTabId.value = tabid
    }
}

const onSubmit = async () => {

    try {
        const fieldsToStorage = {...fields}

        fieldsToStorage.dateFrom = datePickers.dateFrom.selectedDates[0].toString()
        fieldsToStorage.dateTo = datePickers.dateTo.selectedDates[0].toString()
        
        chrome.storage.local.set({ filterFields: fieldsToStorage })
        toast?.show('success', 'Фильтр сохранен')
        
    } catch(error: any) {
        toast?.show('error', 'Не удалось сохранить фильтр')
    }

    try {
        chrome.tabs.create({url: fields.profileLink, active: false});

    } catch (error: any) {
        toast?.show('error', 'Не удалось открыть ссылку')
    }
}

onBeforeMount(async () => {

})

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