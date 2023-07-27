<template>
    <Header></Header>
    <main class="centered">
        <keep-alive>
            <ReviewsFilter ref="filterRef" v-if="activeTab === MainTabsEnum.ReviewsFilter"></ReviewsFilter>
        </keep-alive>
        <ProfileInfoList v-if="activeTab === MainTabsEnum.ProfileInfoList"></ProfileInfoList>
        <ProfileSavedList v-if="activeTab === MainTabsEnum.ProfileSavedList"></ProfileSavedList>
        <Settings v-if="activeTab === MainTabsEnum.Settings"></Settings>
    </main>
</template>

<script lang="ts" setup>
import Header from '@/components/common/Header.vue';
import ReviewsFilter from '@/components/views/ReviewsFilter.vue';
import ProfileInfoList from '@/components/views/ProfileInfoList.vue';
import ProfileSavedList from '@/components/views/ProfileSavedList.vue';
import Settings from '@/components/views/Settings.vue';

import { onMounted, ref } from 'vue';
import { activeTab } from '@/reactive/useMainTabs';
import { useToast } from '@/reactive/useToast';
import { MainTabsEnum } from '@/types/enums';
import { profileInfoList, profileInfoListPushData } from '@/reactive/useProfileList';
import { parsedReviewsList } from '@/reactive/useReviewsItems';
import { apiParsingResultsCreate } from '@/reactive/useParsingResults';
import { setExtensionTabActive } from '@/helpers/common';
import { initDBCollections } from '@/db/db';
import { reviewsFilterFindNewProfileLink, reviewsFilterFindProfileLinkByUrl } from '@/reactive/useReviewsFilter';

const toast = useToast();

const filterRef = ref<any>()

async function createParsingResult(url: string) {
    const foundParsingProfile = profileInfoList.value.find(item => item.url ===  url)

    if (foundParsingProfile && foundParsingProfile.existsInDataBase) {
        await apiParsingResultsCreate(foundParsingProfile)
    }
}

onMounted(async () => {

    initDBCollections()

    chrome.runtime.onMessage.addListener(async ({ 
        message,
        action,
        status,
        currentUrl,
        data,
    }) => {

        if (status && message) {
            toast?.show(status, message)
        }

        if (action === 'reviews-parsing-started') {
            const currentProfileLink = reviewsFilterFindProfileLinkByUrl(currentUrl)
            currentProfileLink && (currentProfileLink.status = 'wait')
        }

        if (action === 'reviews-parsing-ended') {
            if (status === 'success') {
                parsedReviewsList.push(...data)
                createParsingResult(currentUrl)
                const currentProfileLink = reviewsFilterFindProfileLinkByUrl(currentUrl)
                currentProfileLink && (currentProfileLink.status = 'success')
            }

            if (status === 'error') {
                const currentProfileLink = reviewsFilterFindProfileLinkByUrl(currentUrl)
                currentProfileLink && (currentProfileLink.status = 'error')
            }

            const findNewLink = reviewsFilterFindNewProfileLink()

            if (findNewLink) {
                filterRef.value?.onSubmit()
            } else {
                activeTab.value = MainTabsEnum.ProfileInfoList
                setExtensionTabActive()
            }
        }

        if (action === 'profile-info') {
            profileInfoListPushData(data)
        }
    })
})
</script>