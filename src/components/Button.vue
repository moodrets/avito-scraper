<template>
    <button class="button" @click="emits('click')">
        <div class="button-loader" v-if="props.loading">
            <i class="font-icon animate-spin text-4xl block">rotate_right</i>
        </div>
        <i :class="{'opacity-0' : props.loading}" class="font-icon mr-2 text-xl" v-if="props.icon">{{ props.icon }}</i>
        <span :class="{'opacity-0' : props.loading}"><slot></slot></span>
    </button>
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        icon?: string,
        loading?: boolean
    }>(),
    {
        icon: '',
        loading: false
    }
)
const emits = defineEmits(['click'])
</script>

<style lang="scss">
.button {
    @apply relative inline-flex items-center bg-blue-500 text-white outline-none rounded-lg px-2 py-1 text-sm;

    &-loader {
        @apply absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2;
    }

    &:hover {
        @apply bg-blue-600 text-white;
    }
}
</style>