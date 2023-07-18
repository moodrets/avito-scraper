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
                <div class="mb-2 text-sm">Интервал (указываем в секундах)</div>
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
import { loading } from '@/reactive/useAppLoader';
import { onBeforeMount, onBeforeUnmount, onMounted, reactive } from 'vue';

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

const onSubmit = async () => {
    loading.value = true

    BROWSER.openTab({url: fields.profileLink, active: false})

    try {

    } catch (error: any) {

    }
}

const onReset = async () => {
    fields.ratingFrom = 4
    fields.ratingTo = 5
    fields.deliveryOnly = false
    fields.profileLink = '',
    fields.productName = '',
    fields.interval = 0

    datePickers.dateFrom.selectDate(getDateYesterday()) 
    datePickers.dateTo.selectDate(new Date())
}

const onStopSearch = async () => {
}

onBeforeMount(async () => {

})

onMounted(()=>{
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