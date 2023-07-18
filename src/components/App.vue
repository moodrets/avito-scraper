<template>
  <Header></Header>
  <main class="centered">
    <keep-alive>
      <FilterForm v-if="activeTab === 'filter'"></FilterForm>
    </keep-alive>
  </main>
</template>

<script lang="ts" setup>
import Header from '@/components/Header.vue'
import FilterForm from '@/components/FilterForm.vue'

import { onMounted } from 'vue'
import { activeTab } from '@/reactive/useMainTabs'
import { useToast } from '@/reactive/useToast'
import { appStart } from '@/reactive/useAppState'
import { loading } from '@/reactive/useAppLoader'

const toast = useToast()

onMounted(() => {
  appStart.value = Date.now()

  chrome.runtime.onMessage.addListener((request) => {
    if (request.toastType) {
      toast?.show(request.toastType, request.toastText)
    }

    if (request.action === 'parsing-started') {
      loading.value = true
    }
  })
})
</script>