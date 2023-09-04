<template>
    <div 
        class="app-wrapper transition-opacity duration-200 delay-100" 
        :class="appLoaded ? 'opacity-100' : 'opacity-0'"
    >
        <Header></Header>
        <main class="centered">
            <KeepAlive>
                <ProfilesSearchPage v-if="appTabs.active.value === AppTabsEnum.ProfilesSearch" />
                <ProfilesParsedPage v-if="appTabs.active.value === AppTabsEnum.ProfilesParsing" />
            </KeepAlive>
            <ProfilesSavedPage v-if="appTabs.active.value === AppTabsEnum.ProfilesSaved" />
            <SettingsPage v-if="appTabs.active.value === AppTabsEnum.Settings" />
        </main>
    </div>
    <DevPanel v-if="devPanelVisible"></DevPanel>
</template>

<script lang="ts" setup>
import Header from '@/components/common/Header.vue';
import DevPanel from '@/components/common/DevPanel.vue';
import ProfilesParsedPage from '@/components/views/ProfilesParsedPage.vue';
import ProfilesSearchPage from '@/components/views/ProfilesSearchPage.vue';
import ProfilesSavedPage from '@/components/views/ProfilesSavedPage.vue';
import SettingsPage from '@/components/views/SettingsPage.vue';

import { onMounted, ref, computed } from 'vue';
import { showAppStartMessageFromStorage, randomNumberBetween, setExtensionTabActive, wait } from '@/helpers/common';
import { toast } from '@/helpers/toast';
import { initDBCollections } from '@/db/db';
import { AppTabsEnum, appTabs } from '@/reactive/useAppTabs';
import { reviewsFilter } from '@/reactive/useReviewsFilter';
import { profilesParsedList } from '@/reactive/useProfilesParsedList';
import { profilesSavedList } from '@/reactive/useProfileSavedList';
import { MessagesEnum } from '@/types/enums';
import { profilesSearchedList } from '@/reactive/useProfilesSearchedList';
import { profilesFilter } from '@/reactive/useProfilesFilter';

const appLoaded = ref<boolean>(false)

const devPanelVisible = computed<boolean>(() => {
    let urlParams = new URLSearchParams(window.location.search)
    return urlParams.has('dev') ? true : false 
})

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
            reviewsFilter.profileLinkSetStatus(currentUrl, 'wait')
        }

        if (action === 'reviews-parsing-ended') {
            if (status === 'success') {
                profilesParsedList.pushResultsByUrl(currentUrl, data)
                profilesSavedList.pushParsingResult(currentUrl)
                reviewsFilter.profileLinkSetStatus(currentUrl, 'success')
            }

            if (status === 'error') {
                reviewsFilter.profileLinkSetStatus(currentUrl, 'error')
            }

            if (reviewsFilter.profileLinkNew) {
                const waitOpenPageToast = toast.show('success', MessagesEnum.WaitOpenPage, {duration: 172800})
                await wait(randomNumberBetween(2, 10) * 1000)
                toast.drop(waitOpenPageToast)
                reviewsFilter.parsingStart()
            } else {
                setExtensionTabActive()
                toast.show('success', MessagesEnum.ParsingReviewsFinished, {duration: 172800})
                appTabs.changeTab(AppTabsEnum.ProfilesParsing)
                reviewsFilter.apiCreateFilter()
                profilesParsedList.apiCreateList()
            }
        }

        if (action === 'profile-info') {
            profilesParsedList.pushProfileInList(data)
            reviewsFilter.profileLinkSetInfo(currentUrl, data)
        }

        if (action === 'profiles-parsing-started') {
            if (status === 'success') {
                profilesSearchedList.state.loading = true
            }
        }

        if (action === 'profiles-parsing-current-page') {
            if (status === 'success') {
                profilesFilter.state.currentPage = data
            }
        }

        if (action === 'profiles-parsing-category-info') {
            if (status === 'success') {
                profilesFilter.fields.pageTitle = data
            }
        }

        if (action === 'profiles-parsing-ended') {
            if (status === 'success') {
                setExtensionTabActive()
                appTabs.changeTab(AppTabsEnum.ProfilesSearch)
                profilesSearchedList.state.loading = false
                profilesSearchedList.pushProfilesList(data)
                profilesSearchedList.apiCreateList()
                profilesFilter.apiCreateFilter()
            }

            if (status === 'error') {
                profilesSearchedList.state.loading = false
                toast.show('error', MessagesEnum.ProfilesParsingError, {duration: 172800})
            }
        }
    })

    document.fonts.onloadingdone = () => {
        appLoaded.value = true
    }

    appTabs.setActiveTabFromStorage()

    showAppStartMessageFromStorage()
    
    setTimeout(async () => {
        reviewsFilter.setFilterFromDB()
        profilesFilter.setFilterFromDB()
        profilesParsedList.list.value = await profilesParsedList.apiGetList()
        profilesSearchedList.list.value = await profilesSearchedList.apiGetList()
        profilesSearchedList.checkProfilesInParsingFilter()
        profilesSearchedList.checkProfilesInDB()
    }, 0)
})
</script>