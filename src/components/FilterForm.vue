<template>
    <form class="pb-20" @submit.prevent="onSubmit">
        <div class="grid grid-cols-2 gap-5">
            <div>
                <div class="mb-2 text-sm">Ссылка на профиль</div>
                <input v-model="fields.profileLink" type="text" class="text-base w-full text-black px-3 py-2 rounded-lg outline-none">
            </div>
            <div>
                <div class="mb-2 text-sm">Название товара</div>
                <input v-model="fields.productName" type="text" class="text-base w-full text-black px-3 py-2 rounded-lg outline-none">
            </div>
            <div>
                <div class="mb-2 text-sm">Дата от</div>
                <input 
                    v-model="fields.dateFrom"
                    required
                    type="text"
                    id="dateFrom" 
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none"
                >
            </div>
            <div>
                <div class="mb-2 text-sm">Дата до</div>
                <input 
                    v-model="fields.dateTo"
                    required 
                    type="text" 
                    id="dateTo"
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none"
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
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none"
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
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none"
                >
            </div>
            <div>
                <label class="inline-flex items-center">
                    <input v-model="fields.deliveryOnly" type="checkbox" class="w-6 h-6 mr-3">
                    <div class="text-base">Только с доставкой</div>
                </label>
            </div>
        </div>
        <div class="flex items-center justify-between gap-4 fixed bottom-0 left-0 right-0 p-3 bg-gray-600 border-t border-gray-500">
            <Button theme="success" type="submit" icon="search">Начать поиск</Button>
            <Button theme="warning" type="button" icon="cancel">Сбросить фильтр</Button>
            <Button theme="danger" type="button" icon="cancel">Остановить поиск</Button>
        </div>
    </form>
</template>

<script setup lang="ts">
import AirDatepicker from 'air-datepicker';
import Button from '@/components/Button.vue'
import { loading } from '@/reactive/useAppLoader';
import { onBeforeMount, onBeforeUnmount, onMounted, reactive } from 'vue';

const fields = reactive({
    profileLink: '',
    productName: '',
    dateFrom: '',
    dateTo: '',
    ratingFrom: 4,
    ratingTo: 5,
    deliveryOnly: false,
})

const datePickers: Record<string, any> = {
    dateFrom: null,
    dateTo: null,
}

const datePickersConfig: Record<string, any> = {
    onSelect: ({formattedDate, datepicker}: any) => {

        if (datepicker.$el.id === 'dateFrom') {
            fields.dateFrom = formattedDate
            datepicker.hide()
        }

        if (datepicker.$el.id === 'dateTo') {
            fields.dateTo = formattedDate
            datepicker.hide()
        }
    }
}

const onSubmit = async () => {
    loading.value = true

    try {

    } catch (error: any) {

    }
}

onBeforeMount(async () => {
    const storageResult = await BROWSER.storageGet('fields')
    console.dir(storageResult);
})

onMounted(()=>{
    datePickers.dateFrom = new AirDatepicker('#dateFrom', datePickersConfig)
    datePickers.dateTo = new AirDatepicker('#dateTo', datePickersConfig)
})

onBeforeUnmount(()=>{
    datePickers.dateFrom.destroy()
    datePickers.dateTo.destroy()
})
</script>