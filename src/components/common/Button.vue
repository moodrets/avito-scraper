<template>
    <button class="button" :class="[`button--${props.size}`, `button--${props.theme}`, props.loading ? 'pointer-events-none' : '']">
        <div class="button-loader" v-if="props.loading">
            <i class="font-icon animate-spin !text-3xl block">rotate_right</i>
        </div>
        <i :class="{'opacity-0' : props.loading}" class="font-icon mr-2" v-if="props.icon">{{ props.icon }}</i>
        <span :class="{'opacity-0' : props.loading}"><slot></slot></span>
    </button>
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        icon?: string,
        loading?: boolean,
        size?: 'lg' | '',
        theme?: 'danger' | 'success' | 'info' | 'warning'
    }>(),
    {
        icon: '',
        loading: false,
        size: '',
        theme: 'info'
    }
)
</script>

<style lang="scss">
.button {
    @apply relative font-medium inline-flex items-center bg-blue-500 text-white outline-none rounded-lg px-3 py-1 text-sm;

    &-loader {
        @apply absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2;
    }

    &:hover {
        @apply bg-blue-600 text-white;
    }

    .font-icon {
        @apply text-xl;
    }

    &--lg {
        @apply px-4 py-3.5 text-base;

        .font-icon {
            @apply text-2xl;
        }
    }

    &--danger {
        @apply bg-red-500 hover:bg-red-600;
    }

    &--success {
        @apply bg-green-500 hover:bg-green-600;
    }

    &--warning {
        @apply bg-orange-500 hover:bg-orange-600;
    }
}
</style>