<template>
  <Header></Header>
  <main class="px-5">
    <FilterForm v-if="activeTab === 'filter'"></FilterForm>
  </main>
  <Spinner v-if="loading"></Spinner>
</template>

<script lang="ts" setup>
import Header from '@/components/Header.vue'
import Spinner from '@/components/Spinner.vue'
import FilterForm from '@/components/FilterForm.vue'
import { loading } from '@/reactive/useAppLoader'
import { activeTab } from '@/reactive/useMainTabs';
</script>