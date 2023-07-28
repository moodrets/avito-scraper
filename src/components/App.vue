<template>
    <Header></Header>
    <main class="centered">
        <keep-alive>
            <ReviewsFilter ref="filterRef" v-if="activeTab === MainTabsEnum.ReviewsFilter"></ReviewsFilter>
        </keep-alive>
        <ParsingResult v-if="activeTab === MainTabsEnum.ParsingResult"></ParsingResult>
        <ProfileSavedList v-if="activeTab === MainTabsEnum.ProfileSavedList"></ProfileSavedList>
        <Settings v-if="activeTab === MainTabsEnum.Settings"></Settings>
    </main>
</template>

<script lang="ts" setup>
import Header from '@/components/common/Header.vue';
import ReviewsFilter from '@/components/views/ReviewsFilter.vue';
import ParsingResult from '@/components/views/ParsingResult.vue';
import ProfileSavedList from '@/components/views/ProfileSavedList.vue';
import Settings from '@/components/views/Settings.vue';

import { onMounted, ref } from 'vue';
import { activeTab } from '@/reactive/useMainTabs';
import { useToast } from '@/reactive/useToast';
import { MainTabsEnum } from '@/types/enums';
import { profileInfoList } from '@/reactive/useProfileList';
import { parsedReviewsList } from '@/reactive/useReviewsItems';
import { setExtensionTabActive, wait } from '@/helpers/common';
import { initDBCollections } from '@/db/db';
import { reviewsFilterFindNewProfileLink, reviewsFilterFindProfileLinkByUrl, setCurrentProfileLinkInfo } from '@/reactive/useReviewsFilter';
import { reviewsFilterFields } from '@/reactive/useReviewsFilter';
import { apiProfilePushParsingResult } from '@/api/Profiles';

const toast = useToast()

const filterRef = ref<any>()

async function pushParsingResult(url: string) {
    const findProfileInfoList = profileInfoList.value.find(item => item.url === url)
    if (findProfileInfoList) {
        try {
            await apiProfilePushParsingResult(findProfileInfoList)
        } catch(error: any) {
            console.log(error);
        } finally {

        }
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
                pushParsingResult(currentUrl)
                const currentProfileLink = reviewsFilterFindProfileLinkByUrl(currentUrl)
                currentProfileLink && (currentProfileLink.status = 'success')
            }

            if (status === 'error') {
                const currentProfileLink = reviewsFilterFindProfileLinkByUrl(currentUrl)
                currentProfileLink && (currentProfileLink.status = 'error')
            }

            const findNewLink = reviewsFilterFindNewProfileLink()

            if (findNewLink) {
                await wait(reviewsFilterFields.openTabInterval * 1000)
                filterRef.value?.onSubmit()
            } else {
                activeTab.value = MainTabsEnum.ParsingResult
                setExtensionTabActive()
            }
        }

        if (action === 'profile-info') {
            profileInfoList.value.push(data)
            setCurrentProfileLinkInfo(currentUrl, data)
        }
    })
})
</script>