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

import { onBeforeMount } from 'vue'
import { activeTab } from '@/reactive/useMainTabs'
import { useToast } from '@/reactive/useToast'

const toast = useToast()

onBeforeMount(async () => {
  BROWSER.listenMessage((request: any) => {
    if (request.toastType) {
      toast?.show(request.toastType, request.toastText)
    }
  })
})
</script>