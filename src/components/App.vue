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
</template>

<script lang="ts" setup>
import Header from '@/components/common/Header.vue';
import ProfilesParsedPage from '@/components/views/ProfilesParsedPage.vue';
import ProfilesSearchPage from '@/components/views/ProfilesSearchPage.vue';
import ProfilesSavedPage from '@/components/views/ProfilesSavedPage.vue';
import SettingsPage from '@/components/views/SettingsPage.vue';

import { onMounted, ref } from 'vue';
import { randomNumberBetween, setExtensionTabActive, wait } from '@/helpers/common';
import { toast } from '@/helpers/toast';
import { initDBCollections } from '@/db/db';
import { AppTabsEnum, appTabs } from '@/reactive/useAppTabs';
import { reviewsFilter } from '@/reactive/useReviewsFilter';
import { profileInfoList } from '@/reactive/useProfileInfoList';
import { profileSavedList } from '@/reactive/useProfileSavedList';
import { MessagesEnum } from '@/types/enums';
import { profilesSearchedList } from '@/reactive/useProfilesSearchedList';

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
                appTabs.changeTab(AppTabsEnum.ProfilesParsing)
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
                ${data.deliveryInfo}&nbsp;&nbsp;/&nbsp;&nbsp;
                Активные ${data.activeAdds}
                ${data.completedAdds ? '&nbsp;&nbsp;/&nbsp;&nbsp; Завершенные ' + data.completedAdds : ''}
            `
            reviewsFilter.profileLinkSetInfo(currentUrl, linkInfo)
        }

        if (action === 'profiles-parsing-started') {
            if (status === 'success') {
                profilesSearchedList.state.loading = true
            }
        }

        if (action === 'profiles-parsing-current-page') {
            if (status === 'success') {
                profilesSearchedList.state.currentPage = data
            }
        }

        if (action === 'profiles-parsing-ended') {
            if (status === 'success') {
                profilesSearchedList.state.loading = false
                toast.show('success', MessagesEnum.ProfilesParsingEnded, {duration: 172800})
                setExtensionTabActive()
                profilesSearchedList.pushProfileList(data)
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

    profileInfoList.list.value = await profileInfoList.apiGetInfoList()
    
    setTimeout(() => {
        reviewsFilter.setFilterFromDB()
    }, 0)
})
</script>