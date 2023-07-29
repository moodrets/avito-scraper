<template>
    <Header></Header>
    <main class="centered">
        <keep-alive>
            <ReviewsFilter ref="filterRef" v-if="appTabs.active.value === AppTabsEnum.ReviewsFilter"></ReviewsFilter>
        </keep-alive>
        <ParsingResult v-if="appTabs.active.value === AppTabsEnum.ParsingResult"></ParsingResult>
        <ProfileSavedList v-if="appTabs.active.value === AppTabsEnum.ProfileSavedList"></ProfileSavedList>
        <Settings v-if="appTabs.active.value === AppTabsEnum.Settings"></Settings>
    </main>
</template>

<script lang="ts" setup>
import Header from '@/components/common/Header.vue';
import ReviewsFilter from '@/components/views/ReviewsFilter.vue';
import ParsingResult from '@/components/views/ParsingResult.vue';
import ProfileSavedList from '@/components/views/ProfileSavedList.vue';
import Settings from '@/components/views/Settings.vue';

import { onMounted } from 'vue';
import { setExtensionTabActive } from '@/helpers/common';
import { toast } from '@/helpers/toast';
import { initDBCollections } from '@/db/db';
import { AppTabsEnum, appTabs } from '@/reactive/useAppTabs';
import { reviewsFilter } from '@/reactive/useReviewsFilter';
import { profileInfoList } from '@/reactive/useProfileInfoList';
import { profileSavedList } from '@/reactive/useProfileSavedList';

onMounted(async () => {

    initDBCollections()

    chrome.runtime.onMessage.addListener(async ({
        message,
        action,
        status,
        currentUrl,
        data
    }) => {

        if (status && message) {
            toast.show(status, message)
        }

        if (action === 'reviews-parsing-started') {
            const currentProfileLink = reviewsFilter.getProfileLinkByUrl(currentUrl)
            currentProfileLink && (currentProfileLink.status = 'wait')
        }

        if (action === 'reviews-parsing-ended') {
            if (status === 'success') {
                profileInfoList.pushProductsByUrl(currentUrl, data)
                profileSavedList.pushParsingResult(currentUrl)

                const currentProfileLink = reviewsFilter.getProfileLinkByUrl(currentUrl)
                currentProfileLink && (currentProfileLink.status = 'success')
            }

            if (status === 'error') {
                const currentProfileLink = reviewsFilter.getProfileLinkByUrl(currentUrl)
                currentProfileLink && (currentProfileLink.status = 'error')
            }

            if (reviewsFilter.newProfileLink) {
                // TODO: нужно прикрутить рандомайзер
                reviewsFilter.parsingStart()
            } else {
                appTabs.changeTab(AppTabsEnum.ParsingResult)
                setExtensionTabActive()
            }
        }

        if (action === 'profile-info') {
            profileInfoList.list.value.push(data)

            let linkInfo = `
                ${data.name}&nbsp;&nbsp;/&nbsp;&nbsp; 
                ${data.rating}&nbsp;&nbsp;/&nbsp;&nbsp; 
                ${data.reviewsCount}&nbsp;&nbsp;/&nbsp;&nbsp; 
                ${data.subscribers}&nbsp;&nbsp;/&nbsp;&nbsp; 
                ${data.deliveryInfo}
            `
            reviewsFilter.setProfileLinkInfo(currentUrl, linkInfo)
        }
    })
})
</script>