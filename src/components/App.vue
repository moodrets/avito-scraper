<template>
	<Header></Header>
	<main class="centered">
		<keep-alive>
			<FilterForm v-if="activeTab === 'filter'"></FilterForm>
		</keep-alive>
		<ParsingResult v-if="activeTab === 'parsing_result'"></ParsingResult>
		<ProfileList v-if="activeTab === 'profile_list'"></ProfileList>
	</main>
</template>

<script lang="ts" setup>
import Header from '@/components/common/Header.vue'
import FilterForm from '@/components/views/FilterForm.vue'
import ParsingResult from '@/components/views/ParsingResult.vue'
import ProfileList from '@/components/views/ProfileList.vue'

import { onMounted } from 'vue'
import { activeTab } from '@/reactive/useMainTabs'
import { useToast } from '@/reactive/useToast'
import { appStart } from '@/reactive/useAppState'
import { loading } from '@/reactive/useAppLoader'
import { profileInfo } from '@/reactive/useProfileInfo'

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

		if (action === 'parsing-started') {
			loading.value = true
		}

		if (action === 'parsing-ended') {
			loading.value = false

			if (parsedReviewsList?.length) {
				activeTab.value = 'parsing_result'
			}
		}

		if (profileInform) {
			profileInfo.value = profileInform
		}
	})
})
</script>