<template>
	<Header></Header>
	<main class="centered">
		<keep-alive>
			<FilterForm v-if="activeTab === MainTabsEnum.Filter"></FilterForm>
		</keep-alive>
		<ReviewsList v-if="activeTab === MainTabsEnum.ReviewsResult"></ReviewsList>
		<ProfileList v-if="activeTab === MainTabsEnum.ProfileList"></ProfileList>
	</main>
</template>

<script lang="ts" setup>
import Header from '@/components/common/Header.vue'
import FilterForm from '@/components/views/FilterForm.vue'
import ReviewsList from '@/components/views/ReviewsList.vue'
import ProfileList from '@/components/views/ProfileList.vue'

import { onMounted } from 'vue'
import { activeTab } from '@/reactive/useMainTabs'
import { useToast } from '@/reactive/useToast'
import { appStart } from '@/reactive/useAppState'
import { loading } from '@/reactive/useAppLoader'
import { profileInfo } from '@/reactive/useProfileInfo'
import { reviewsList } from '@/reactive/useReviewsList'
import { MainTabsEnum } from '@/types/enums'

const toast = useToast()

onMounted(async () => {
  	appStart.value = Date.now()

	chrome.runtime.onMessage.addListener(({
		toastType, 
		toastText, 
		action, 
		profileInform, 
		parsedReviewsList
	}) => {
		
		if (toastType && toastText) {
			toast?.show(toastType, toastText)
		}

		if (action === 'reviews-parsing-started') {
			loading.value = true
		}

		if (action === 'reviews-parsing-ended') {
			loading.value = false

			if (parsedReviewsList?.length) {
				reviewsList.value = parsedReviewsList
				activeTab.value = MainTabsEnum.ReviewsResult
			}
		}

		if (profileInform) {
			profileInfo.value = profileInform
		}
	})
})
</script>