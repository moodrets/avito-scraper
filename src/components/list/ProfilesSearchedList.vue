<template>
    <div v-if="profilesFilter.state.profilesList.length" class="pb-14">
        <div class="mb-8 font-bold text-xl">
            <div>Найдено продавцов - <strong>{{ profilesFilter.state.profilesList.length }}</strong></div>
        </div>
        <table class="w-full relative">
            <tr class="text-[16px] sticky top-[64px] bg-gray-600">
                <th class="text-left px-4 py-2 border border-white border-opacity-50">
                    <SortHeading
                        label="Имя"
                        :sort-types="['name_desc', 'name_asc']"
                        :current-sort-type="profilesFilter.state.profilesListSortType"
                        @sort="onSort"
                    ></SortHeading>
                </th>
                <th class="text-left px-4 py-2 border border-white border-opacity-50">
                    <SortHeading
                        label="Рейтинг"
                        :sort-types="['rating_desc', 'rating_asc']"
                        :current-sort-type="profilesFilter.state.profilesListSortType"
                        @sort="onSort"
                    ></SortHeading>
                </th>
                <th class="text-left px-4 py-2 border border-white border-opacity-50">
                    <SortHeading
                        label="Отзывы"
                        :sort-types="['reviews_desc', 'reviews_asc']"
                        :current-sort-type="profilesFilter.state.profilesListSortType"
                        @sort="onSort"
                    ></SortHeading>
                </th>
                <th class="text-left px-4 py-2 border border-white border-opacity-50">
                    <SortHeading
                        label="Найден в базе"
                        :sort-types="['db_exist_desc', 'db_exist_asc']"
                        :current-sort-type="profilesFilter.state.profilesListSortType"
                        @sort="onSort"
                    ></SortHeading>
                </th>
            </tr>
            <tr
                v-for="profile in profilesFilter.state.profilesList" 
                :key="profile.name" 
                class="text-[14px] hover:bg-gray-600"
            >
                <td class="px-4 py-2 border border-white border-opacity-50 font-medium">
                    <div class="flex items-center gap-4">
                        <i class="font-icon text-3xl text-amber-400 cursor-pointer" @click="onPushLinkToFilter(profile)">add_to_photos</i>
                        <a class="text-white hover:text-white text-xl font-medium border-b border-dashed border-white" target="_blank" :href="profile.url">{{ profile.name }}</a>
                    </div>
                </td>
                <td class="px-4 py-2 border border-white border-opacity-50 font-medium">{{ profile.rating }}</td>
                <td class="px-4 py-2 border border-white border-opacity-50 font-medium">{{ profile.reviewsCount }}</td>
                <td class="px-4 py-2 border border-white border-opacity-50 font-medium">
                    <strong 
                        :class="profile.existsInDataBase ? 'text-green-400' : 'text-red-400'"
                    >{{ profile.existsInDataBase ? 'Да' : 'Нет' }}</strong>
                </td>
            </tr>
        </table>
    </div>
</template>

<script setup lang="ts">
import SortHeading from '@/components/common/SortHeading.vue'
import { toast } from '@/helpers/toast';
import { IProfileInAdd, profilesFilter } from '@/reactive/useProfilesFilter';
import { reviewsFilter } from '@/reactive/useReviewsFilter';
import { MessagesEnum } from '@/types/enums';

function onSort(sortValue: string) {
    profilesFilter.sortProfileList(sortValue)
}

function onPushLinkToFilter(profile: IProfileInAdd) {
    reviewsFilter.profileLinkPushNew(profile.url)
    reviewsFilter.profileLinksHighlightDuplicates()
    reviewsFilter.profileLinksRemoveEmpty()
    toast.show('success', MessagesEnum.ProfileLinkAddedInReviewsFilter)
}
</script>