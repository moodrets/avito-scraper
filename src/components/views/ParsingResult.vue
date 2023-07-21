<template>
    <ProfileInfo />
    <template v-if="reviewsList.length">

    </template>
    <template v-else>
        <div class="text-center text-2xl font-bold">Ничего нет</div>
    </template>
</template>

<script setup lang="ts">
import ProfileInfo from '@/components/common/ProfileInfo.vue'
import { reviewsList } from '@/reactive/useReviewsList';
</script>