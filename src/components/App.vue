<template>
  <Header></Header>
  <main class="px-5">
    <keep-alive>
      <FilterForm v-if="activeTab === 'filter'"></FilterForm>
    </keep-alive>
  </main>
  <Spinner v-if="loading"></Spinner>
</template>

<script lang="ts" setup>
import Header from '@/components/Header.vue'
import Spinner from '@/components/Spinner.vue'
import FilterForm from '@/components/FilterForm.vue'

import { onBeforeMount, reactive } from 'vue'
import { loading } from '@/reactive/useAppLoader'
import { activeTab } from '@/reactive/useMainTabs'
import { useToast } from '@/reactive/useToast'

const toast = useToast()

const appState = reactive<any>({
  avitoTabClosed: false
})

onBeforeMount(async () => {
  try {
    await BROWSER.sendMessage({state: 'loadFirst'}, 'popup')
  } catch (error: any) {
    toast?.show('warning', 'Вкладка avito не активна')
    appState.avitoTabClosed = true
  }

  BROWSER.listenMessage((request: any) => {
    if (request.toastType) {
      toast?.show(request.toastType, request.toastText)
    }
  })
})
</script>