<template>
    <form class="pb-20" @submit.prevent="onSubmit">
        <div class="grid grid-cols-4 gap-5">
            <div class="col-span-4">
                <div class="text-sm font-medium mb-2">Ссылки на профили</div>
                <div
                    v-for="link, index in reviewsFilter.fields.profilesLinks"
                    :key="index" 
                    :class="index > 0 ? 'mt-5' : ''"
                >
                    <div class="flex items-center gap-4">
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
                            @input="onInputLink(link)"
                        >
                        <div v-if="reviewsFilter.fields.profilesLinks.length > 1" class="flex-none cursor-pointer select-none">
                            <i class="font-icon text-3xl block text-red-400" @click="reviewsFilter.removeProfileLink(index)">remove_circle_outline</i>
                        </div>
                        <div class="flex-none cursor-pointer select-none ml-auto">
                            <i class="font-icon text-3xl block text-green-400" @click="reviewsFilter.pushNewProfileLink()">add_circle_outline</i>
                        </div>
                    </div>
                    <div v-if="link.info" class="mt-3 ml-12 font-medium" v-html="link.info"></div>
                </div>
            </div>
            <div>
                <div class="mb-2 text-sm font-medium">Дата от</div>
                <input 
                    v-model="reviewsFilter.fields.dateFrom"
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
                    v-model="reviewsFilter.fields.dateTo"
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
                    v-model="reviewsFilter.fields.productName"
                    tabindex="9"
                    type="search" 
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            
            <div>
                <div class="mb-2 text-sm font-medium">Рейтинг от</div>
                <input 
                    v-model="reviewsFilter.fields.ratingFrom"
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
                    v-model="reviewsFilter.fields.ratingTo"
                    tabindex="5"
                    type="number"
                    min="1"
                    max="5"
                    required
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div>
                <div class="mb-2 text-sm font-medium">Интервал прокрутки отзывов (сек.)</div>
                <input 
                    v-model="reviewsFilter.fields.scrollInterval"
                    tabindex="10"
                    type="number"
                    min="0"
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div>
                <div class="mb-2 text-sm font-medium">Интервал открытия страниц (сек.)</div>
                <input 
                    v-model="reviewsFilter.fields.openTabInterval"
                    tabindex="11"
                    type="number"
                    min="0"
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <div class="col-span-4 select-none">
                <label class="inline-block">
                    <div class="mb-3 text-sm font-medium">Только с доставкой</div>
                    <Switch :tabindex="6" v-model="reviewsFilter.fields.deliveryOnly"></Switch>
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
        </div>
    </form>
</template>

<script setup lang="ts">
import Button from '@/components/common/Button.vue';
import Switch from '@/components/common/Switch.vue';

import { onBeforeUnmount, onMounted, ref } from 'vue';
import AirDatepicker from 'air-datepicker';
import { getDateTwoMonthAgo } from '@/helpers/date';
import { reviewsFilter } from '@/reactive/useReviewsFilter';
import { IProfileLink } from '@/reactive/useReviewsFilter';
import { profileInfoList } from '@/reactive/useProfileInfoList';

const datePickers: Record<string, any> = {
    dateFrom: null,
    dateTo: null,
}

const datePickersConfig: Record<string, any> = {
    autoClose: true,
    onSelect: ({formattedDate, datepicker}: any) => {
        if (datepicker.$el.id === 'dateFrom') {
            reviewsFilter.fields.dateFrom = formattedDate
        }

        if (datepicker.$el.id === 'dateTo') {
            reviewsFilter.fields.dateTo = formattedDate
        }
    }
}

function onInputLink(link: IProfileLink) {
    link.status = 'new'
    link.info = ''
}

async function onReset() {
    if (window.confirm('Сбросить фильтр ?')) {
        reviewsFilter.resetFields()
        datePickers.dateFrom.selectDate(getDateTwoMonthAgo()) 
        datePickers.dateTo.selectDate(new Date())
    }
}

async function onSave() {
    reviewsFilter.apiCreateFilter()
}

async function onSubmit(){
    reviewsFilter.setProfileLinksStatusNew()
    reviewsFilter.apiCreateFilter()
    profileInfoList.list.value = []
    reviewsFilter.parsingStart()
}

onMounted(() => {
    datePickers.dateFrom = new AirDatepicker('#dateFrom', datePickersConfig)
    datePickers.dateTo = new AirDatepicker('#dateTo', datePickersConfig)
    datePickers.dateFrom.selectDate(getDateTwoMonthAgo())
    datePickers.dateTo.selectDate(new Date())
    
    setTimeout(async () => {
        const storageResult = await reviewsFilter.setFilterFromDB()

        if (storageResult) {
            datePickers.dateFrom.selectDate(storageResult.dateFrom)
            datePickers.dateTo.selectDate(storageResult.dateTo)
        }
    }, 0)
})

onBeforeUnmount(()=>{
    datePickers.dateFrom.destroy()
    datePickers.dateTo.destroy()
})
</script>