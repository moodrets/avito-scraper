<template>
    <div v-if="profilesParsedList.list.value.length" class="pb-20">
        <div
            v-for="profile, profileIndex in profilesParsedList.list.value"
            :data-profile-url="profile.url"   
            :key="profileIndex"
            class="relative rounded-xl shadow-xl bg-gray-600 text-[16px] mb-3"
            :class="[
                profile.opened ? 'ring ring-blue-400' : '',
                profile?.highlited ? 'ring ring-green-400' : '',
            ]"
        >
            <div
                class="flex items-start p-4 select-none cursor-pointer rounded-xl"
                :class="{
                    'shadow-xl sticky top-[64px] z-20': profile.opened 
                }"
                :style="{'background-image': `linear-gradient(45deg, rgb(75 85 99) 0%, rgb(75 85 99) 70%, ${profile.color.bg} 100%)`}"
                @click="onOpenResults(profile)"
            >
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-4 mb-4">
                        <a
                            class="text-white hover:text-white text-xl font-medium border-b border-dashed border-white"
                            @click.stop="onOpenLink(profile)"
                        >{{ profile.name }}</a>
                        <div
                            v-if="profile.comment" 
                            class="text-[16px] text-sky-300 font-medium italic"
                        >{{ profile.comment }}</div>
                    </div>
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-[16px] font-medium">
                        <div class="text-orange-300">{{ profile.rating }}</div>
                        <div class="text-yellow-300">{{ profile.reviewsCount }}</div>
                        <div class="text-teal-300">{{ profile.subscribers }}</div>
                        <div class="text-rose-300">{{ profile.deliveryInfo }}</div>
                        <div class="text-amber-300">Активные - {{ profile.activeAdds }}</div>
                        <div v-if="profile.completedAdds" class="text-lime-300">Завершенные - {{ profile.completedAdds }}</div>
                        <div v-if="profile.savedDate" class="text-gray-300">{{ profile.savedDate ? toLocaleString(profile.savedDate) : '' }}</div>
                    </div>
                </div>
                <div class="flex-none flex items-center gap-4">
                    <Checkbox
                        :checked="profilesParsedList.isChecked(profile)"
                        @click.stop 
                        @change="onCheck($event, profile)"
                    ></Checkbox>
                    <i class="font-icon text-3xl drop-shadow-xl" @click.stop="onDeleteProfile(profile, profileIndex)">delete_forever</i>
                    <i v-if="profile.existsInDataBase" class="font-icon text-3xl text-white drop-shadow-xl">storage</i>
                    <i v-else class="font-icon text-3xl text-white drop-shadow-xl" @click.stop="onSave(profile)">cloud_upload</i>
                    <i class="font-icon text-3xl drop-shadow-xl" @click.stop="onMark(profile)">{{ profile.marked ? 'bookmark' : 'bookmark_border' }}</i>
                    <!-- <i class="font-icon text-3xl text-white drop-shadow-xl" @click.stop="onCopy(profile)">content_copy</i> -->
                </div>
            </div>
            
            <div v-if="profile.opened" class="text-[14px] px-4 p-5">
                <div v-if="!profile.existsInDataBase" class="mb-8">
                    <div class="mb-3 opacity-80">Комментарий:</div>
                    <input
                        v-model="profile.comment"
                        type="search"
                        required
                        class="text-base w-1/4 max-w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                    >
                </div>
                <template v-if="profile.reviewsList?.length">
                    <div v-if="profile.opened">
                        <div class="mb-5 font-bold text-xl">
                            <div>Найдено отзывов - <strong>{{ profile.reviewsList.length }}</strong></div>
                        </div>
                        <table class="w-full relative">
                            <tr class="shadow-xl text-[16px] sticky top-[164px] z-10 bg-gray-600">
                                <th class="text-left px-4 py-2 border border-white border-opacity-50">
                                    <SortHeading
                                        :sort-types="['date_desc', 'date_asc']"
                                        :current-sort-type="profile.reviewsSortedBy"
                                        label="Дата"
                                        @sort="onSort(profile, $event)"
                                    ></SortHeading>
                                </th>
                                <th class="text-left px-4 py-2 border border-white border-opacity-50">
                                    <SortHeading
                                        :sort-types="['rating_desc', 'rating_asc']"
                                        :current-sort-type="profile.reviewsSortedBy"
                                        label="Оценка"
                                        @sort="onSort(profile, $event)"
                                    ></SortHeading>
                                </th>
                                <th class="text-left px-4 py-2 border border-white border-opacity-50">
                                    <SortHeading
                                        :sort-types="['product_name_desc', 'product_name_asc']"
                                        :current-sort-type="profile.reviewsSortedBy"
                                        label="Название товара"
                                        @sort="onSort(profile, $event)"
                                    ></SortHeading>
                                </th>
                                <th class="text-left px-4 py-2 border border-white border-opacity-50">
                                    <SortHeading
                                        :sort-types="['delivery_desc', 'delivery_asc']"
                                        :current-sort-type="profile.reviewsSortedBy"
                                        label="Доставка"
                                        @sort="onSort(profile, $event)"
                                    ></SortHeading>
                                </th>
                            </tr>
                            <tr v-for="item, index in profile.reviewsList" :key="index" class="text-[14px] hover:bg-gray-600">
                                <td class="px-4 py-2 border border-white border-opacity-50 font-medium">{{ toLocaleString(item.date)?.slice(0, 10) }}</td>
                                <td class="px-4 py-2 border border-white border-opacity-50">
                                    <div class="flex-none flex items-center">
                                        <div class="text-base font-medium mr-1">({{ item.rating }}) - </div>
                                        <div 
                                            v-for="star, starIndex in item.rating"
                                            :ley="starIndex" 
                                            class="text-[18px] font-icon text-yellow-400"
                                        >star</div>
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
                </template>
                <template v-else>
                    <div class="text-xl font-bold text-red-300">Результатов не найдено</div>
                </template>
            </div>
        </div>
        
        <Modal
            v-if="profilesParsedList.state.contentModalVisible"
            width="800px"
            @close="onCloseModal"
        >
            <div class="mb-5">
                <input
                    v-model="profilesParsedList.state.contentModalFilterModel"
                    placeholder="Введите название товара"
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
            <template v-if="profilesParsedList.filteredModalDataList.value.length">
                <div
                    v-for="result, resultIndex in profilesParsedList.filteredModalDataList.value"
                    :key="resultIndex" 
                    class="flex text-sm items-center gap-2 py-0.5 px-1 mb-[2px] font-medium"
                    :style="{'background-color': result.color.bg, 'color': result.color.text}"
                    :title="result.info"
                >
                    <i
                        class="font-icon text-xl cursor-pointer drop-shadow-xl"
                        @click.stop="onHighlightProfile(result.profileUrl)"
                    >arrow_circle_left</i>
                    <a
                        target="_blank"
                        :href="result.profileUrl"
                        :style="{color: result.color.text}"
                        class="font-icon text-xl cursor-pointer drop-shadow-xl" 
                    >account_box</a>
                    <i
                        class="font-icon text-xl cursor-pointer drop-shadow-xl" 
                        @click.stop="onCopyProductName(result.productName)"
                    >content_copy</i>
                    <div>{{ result.productName }}</div>
                    <div v-if="!result.count">{{ toLocaleString(result.date)?.slice(0, 10) }}</div>
                    <strong v-if="result.count">({{ result.count }})</strong>
                </div>
            </template>
            <template v-else>
                <div class="text-center text-xl font-bold">Результаты не найдены</div>
            </template>
        </Modal>
    </div>
    <div v-else class="text-center text-xl font-bold pb-10">Результаты не найдены</div>
</template>

<script lang="ts" setup>
import Modal from '@/components/common/Modal.vue'
import Checkbox from '@/components/common/Checkbox.vue'
import SortHeading from '@/components/common/SortHeading.vue'
import { onMounted, onBeforeUnmount } from 'vue';
import { copyToBuffer } from '@/helpers/common';
import { toLocaleString } from '@/helpers/date'
import { MessagesEnum } from '@/types/enums';
import { toast } from '@/helpers/toast';
import { IProfileItem, profilesParsedList } from '@/reactive/useProfilesParsedList';
import { profilesSavedList } from '@/reactive/useProfileSavedList';

function onCloseModal() {
    profilesParsedList.state.contentModalVisible = false
    profilesParsedList.state.contentModalData = []
    profilesParsedList.state.contentModalFilterModel = ''
}

function onCopyProductName(productName: string) {
    copyToBuffer(productName)
    toast.show('success', MessagesEnum.ProductNameCopied)
}

function onSort(profile: IProfileItem, sortBy: string) {
    profilesParsedList.sortResults(profile, sortBy)
}

function onHighlightProfile(url: string) {
    profilesParsedList.state.contentModalVisible = false
    profilesParsedList.highlightProfile(url)
}

function onOpenResults(profile: IProfileItem) {
    if (profile.opened === undefined) profile.opened = true
    profile.highlited = false
    profile.opened = !profile.opened
}

function onOpenLink(profile: IProfileItem) {
    if (profile.url) {
        window.open(profile.url, '_blank')
    }
}

async function onSave(profile: IProfileItem) {
    await profilesSavedList.apiProfileCreate(profile)
    
    if (profile.id) {
        profilesParsedList.apiUpdateProfile(profile)
    }
}

function onMark(profile: IProfileItem) {
    profile.marked = !profile.marked
    if (profile.id) {
        profilesParsedList.apiUpdateProfile(profile)
    }
}

function onCheck(checked: boolean, profile: IProfileItem) {
    if (checked) {
        profilesParsedList.state.checkedItems[profile.url] = profile
        return
    }

    delete profilesParsedList.state.checkedItems[profile.url]
}

async function onDeleteProfile(profile: IProfileItem, index: number) {
    if (profile.id) {
        profilesParsedList.apiRemoveProfile(profile.id)
    }
    profilesParsedList.list.value.splice(index, 1)
}

onBeforeUnmount(() => {
})

onMounted(async () => {
    if (profilesParsedList.list.value.length === 1) {
        profilesParsedList.list.value[0].opened = true
    }
})
</script>