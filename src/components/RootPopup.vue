<template>
  <Header></Header>
  <main class="flex px-3">
    {{ activeTab }}
  </main>
  <Spinner v-if="loading"></Spinner>
</template>

<script lang="ts" setup>
import Header from '@/components/Header.vue'
import Spinner from '@/components/Spinner.vue'
import { loading } from '@/reactive/useAppLoader'
import { activeTab } from '@/reactive/useMainTabs';
</script>