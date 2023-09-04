<template>
    <div v-if="profilesSearchedList.list.value.length" class="pb-14">
        <div class="mb-8 font-bold text-xl flex items-center gap-4">
            <i
                class="font-icon text-green-400 cursor-pointer text-3xl" 
                @click="onPushProfilesMultipleInParsingFilter()"
            >playlist_add</i>
            <div>Найдено продавцов - <strong>{{ profilesSearchedList.list.value.length }}</strong></div>
        </div>
        <table class="w-full relative">
            <tr class="text-[16px] sticky top-[63px] z-10 bg-gray-600">
                <th class="text-left px-4 py-2 border border-white border-opacity-50">
                    <div class="flex items-center gap-4">
                        <Checkbox
                            :checked="Object.keys(profilesSearchedList.state.checkedItems).length > 0"
                            @change="onSelectAll"
                        />
                        <SortHeading
                            label="Имя"
                            :sort-types="['name_desc', 'name_asc']"
                            :current-sort-type="profilesSearchedList.state.profilesListSortType"
                            @sort="onSort"
                        ></SortHeading>
                    </div>
                </th>
                <th class="text-left px-4 py-2 border border-white border-opacity-50">
                    <SortHeading
                        label="Рейтинг"
                        :sort-types="['rating_desc', 'rating_asc']"
                        :current-sort-type="profilesSearchedList.state.profilesListSortType"
                        @sort="onSort"
                    ></SortHeading>
                </th>
                <th class="text-left px-4 py-2 border border-white border-opacity-50">
                    <SortHeading
                        label="Отзывы"
                        :sort-types="['reviews_desc', 'reviews_asc']"
                        :current-sort-type="profilesSearchedList.state.profilesListSortType"
                        @sort="onSort"
                    ></SortHeading>
                </th>
                <th class="text-left px-4 py-2 border border-white border-opacity-50">
                    <SortHeading
                        label="Найден в базе"
                        :sort-types="['db_exist_desc', 'db_exist_asc']"
                        :current-sort-type="profilesSearchedList.state.profilesListSortType"
                        @sort="onSort"
                    ></SortHeading>
                </th>
            </tr>
            <tr
                v-for="profile, profileIndex in profilesSearchedList.list.value" 
                :key="profileIndex"
                class="text-[14px] hover:bg-gray-600"
            >
                <td class="px-4 py-2 border border-white border-opacity-50 font-medium">
                    <div class="flex items-center gap-4">
                        <Checkbox
                            :checked="isProfileChecked(profile)"
                            :disabled="isProfileInParsingFilter(profile)"
                            @change="onSelectProfileItem($event, profile)"
                        />
                        <i
                            v-if="isProfileInParsingFilter(profile)" 
                            class="font-icon text-3xl text-green-400 cursor-pointer" 
                            @click="onRemoveLinkFromParsingFilter(profile)"
                        >filter_none</i>
                        <i
                            v-else 
                            class="font-icon text-3xl text-amber-400 cursor-pointer" 
                            @click="onPushLinkToParsingFilter(profile)"
                        >add_to_photos</i>
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
import Checkbox from '@/components/common/Checkbox.vue'
import { reviewsFilter } from '@/reactive/useReviewsFilter';
import { IProfileInAdd, profilesSearchedList } from '@/reactive/useProfilesSearchedList';
import { AppTabsEnum, appTabs } from '@/reactive/useAppTabs';

function onSort(sortValue: string) {
    profilesSearchedList.sortProfileList(sortValue)
}

function onSelectAll(checked: boolean) {
    if (checked) {
        profilesSearchedList.list.value.forEach(profile => {
            profilesSearchedList.state.checkedItems[profile.url] = profile
        })
    } else {
        profilesSearchedList.state.checkedItems = {} 
    }
}

function onSelectProfileItem(checked: boolean, profile: IProfileInAdd) {
    if (checked) {
        profilesSearchedList.state.checkedItems[profile.url] = profile
    } else {
        delete profilesSearchedList.state.checkedItems[profile.url]
    }
}

function isProfileChecked(profile: IProfileInAdd) {
    return profile.url in profilesSearchedList.state.checkedItems
}

function isProfileInParsingFilter(profile: IProfileInAdd) {
    return profile.url in profilesSearchedList.state.profilesInParsingFilter
}

function onPushLinkToParsingFilter(profile: IProfileInAdd) {
    if (!isProfileInParsingFilter(profile)) {
        reviewsFilter.profileLinkPushNew(profile.url)
        reviewsFilter.profileLinksHighlightDuplicates()
        reviewsFilter.profileLinksRemoveEmpty()
        profilesSearchedList.state.profilesInParsingFilter[profile.url] = profile
    }
}

function onRemoveLinkFromParsingFilter(profile: IProfileInAdd) {
    profilesSearchedList.removeLinkFromParsingFilter(profile.url)
    reviewsFilter.profileLinkRemoveByUrl(profile.url)
}

function onPushProfilesMultipleInParsingFilter() {
    if (Object.keys(profilesSearchedList.state.checkedItems).length) {
        for (const profileUrl in profilesSearchedList.state.checkedItems) {
            if (!reviewsFilter.profileLinkGetByUrl(profileUrl)) {
                profilesSearchedList.state.profilesInParsingFilter[profileUrl] = profilesSearchedList.state.checkedItems[profileUrl]
                reviewsFilter.profileLinkPushNew(profileUrl)
            }
        }
    } else {
        profilesSearchedList.list.value.forEach(profile => {
            if (!reviewsFilter.profileLinkGetByUrl(profile.url)) {
                profilesSearchedList.state.profilesInParsingFilter[profile.url] = profile
                reviewsFilter.profileLinkPushNew(profile.url)
            }
        })
    }

    reviewsFilter.profileLinksHighlightDuplicates()
    reviewsFilter.profileLinksRemoveEmpty()
    appTabs.changeTab(AppTabsEnum.ProfilesParsing)
}
</script>