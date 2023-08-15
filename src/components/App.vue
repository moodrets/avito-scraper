<template>
    <div 
        class="app-wrapper transition-opacity duration-200 delay-100" 
        :class="appLoaded ? 'opacity-100' : 'opacity-0'"
    >
        <Header></Header>
        <main class="centered">
            <ProfilesFilter v-if="appTabs.active.value === AppTabsEnum.ProfilesFilter"></ProfilesFilter>
            <ParsingResult v-if="appTabs.active.value === AppTabsEnum.ParsingResult"></ParsingResult>
            <ProfileSavedList v-if="appTabs.active.value === AppTabsEnum.ProfileSavedList"></ProfileSavedList>
            <Settings v-if="appTabs.active.value === AppTabsEnum.Settings"></Settings>
            <KeepAlive>
                <ReviewsFilter v-if="appTabs.active.value === AppTabsEnum.ReviewsFilter"></ReviewsFilter>
            </KeepAlive>
        </main>
    </div>
</template>

<script lang="ts" setup>
import Header from '@/components/common/Header.vue';
import ReviewsFilter from '@/components/views/ReviewsFilter.vue';
import ParsingResult from '@/components/views/ParsingResult.vue';
import ProfileSavedList from '@/components/views/ProfileSavedList.vue';
import ProfilesFilter from '@/components/views/ProfilesFilter.vue';
import Settings from '@/components/views/Settings.vue';

import { onMounted, ref } from 'vue';
import { randomNumberBetween, setExtensionTabActive, wait } from '@/helpers/common';
import { toast } from '@/helpers/toast';
import { initDBCollections } from '@/db/db';
import { AppTabsEnum, appTabs } from '@/reactive/useAppTabs';
import { reviewsFilter } from '@/reactive/useReviewsFilter';
import { profileInfoList } from '@/reactive/useProfileInfoList';
import { profileSavedList } from '@/reactive/useProfileSavedList';
import { MessagesEnum } from '@/types/enums';
import { profilesFilter } from '@/reactive/useProfilesFilter';

const appLoaded = ref<boolean>(false)

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
            const currentProfileLink = reviewsFilter.profileLinkGetByUrl(currentUrl)
            currentProfileLink && (currentProfileLink.status = 'wait')
        }

        if (action === 'reviews-parsing-ended') {
            if (status === 'success') {
                profileInfoList.pushResultsByUrl(currentUrl, data)
                profileSavedList.pushParsingResult(currentUrl)
                
                const currentProfileLink = reviewsFilter.profileLinkGetByUrl(currentUrl)
                currentProfileLink && (currentProfileLink.status = 'success')
            }

            if (status === 'error') {
                const currentProfileLink = reviewsFilter.profileLinkGetByUrl(currentUrl)
                currentProfileLink && (currentProfileLink.status = 'error')
            }

            if (reviewsFilter.profileLinkNew) {
                const waitOpenPageToast = toast.show('success', MessagesEnum.WaitOpenPage, {duration: 172800})
                await wait(randomNumberBetween(2, 10) * 1000)
                toast.drop(waitOpenPageToast)
                reviewsFilter.parsingStart()
            } else {
                toast.show('success', MessagesEnum.ParsingReviewsFinished, {duration: 172800})
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
            reviewsFilter.profileLinkSetInfo(currentUrl, linkInfo)
        }

        if (action === 'set-categories') {
            if (status === 'success') {
                setExtensionTabActive()
                profilesFilter.state.categories = data
                profilesFilter.state.categoriesLoading = false
                profilesFilter.apiCreateCategories()
            }
        }

        if (action === 'profiles-search-filter-not-found') {
            if (status === 'error') {
                setExtensionTabActive()
                toast.show('error', MessagesEnum.FilterAddsNotFound, {duration: 172800})
            }
        }

        if (action === 'profiles-search-filter-installed') {
            if (status === 'success') {
                profilesFilter.parsingStart()
            }
        }
    })

    document.fonts.onloadingdone = () => {
        appLoaded.value = true
    }

    profileInfoList.list.value = await profileInfoList.apiGetInfoList()
    profilesFilter.state.categories = await profilesFilter.apiGetCategories()
})
</script>