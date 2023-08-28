<template>
    <button 
        class="button" 
        :class="[
        `button--${props.theme}`, 
        props.loading ? 'pointer-events-none' : '',
        props.icon ? 'px-3 py-1.5' : 'px-3 py-2.5'
    ]">
        <div class="button-loader" v-if="props.loading">
            <i class="font-icon animate-spin text-3xl block">rotate_right</i>
        </div>
        <i
            v-if="props.icon"
            :class="{'opacity-0' : props.loading, 'mr-2' : slots.default}" 
            class="font-icon" >{{ props.icon }}</i>
        <span 
            v-if="slots.default" 
            :class="{'opacity-0' : props.loading}"
        ><slot></slot></span>
    </button>
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        icon?: string,
        loading?: boolean,
        theme?: 'danger' | 'success' | 'info' | 'warning',
    }>(),
    {
        icon: '',
        loading: false,
        theme: 'info',
    }
)

const slots = defineSlots()
</script>

<style lang="scss">
.button {
    @apply 
        relative 
        font-medium 
        inline-flex 
        items-center 
        outline-none 
        rounded-lg
        text-sm;
    
    > .font-icon {
        @apply text-xl;
    }

    &-loader {
        @apply 
            absolute 
            top-1/2 
            left-1/2 
            -translate-x-1/2 
            -translate-y-1/2;
    }

    &--info {
        @apply 
            outline
            outline-offset-2
            bg-blue-500 
            text-white 
            hover:text-white 
            hover:bg-blue-600 
            focus-visible:bg-blue-600
            focus-visible:outline-blue-400;
    }

    &--danger {
        @apply
            outline
            outline-offset-2
            bg-red-500 
            text-white 
            hover:text-white 
            hover:bg-red-600 
            focus-visible:bg-red-600
            focus-visible:outline-red-400;
    }

    &--success {
        @apply
            outline
            outline-offset-2
            bg-green-500 
            text-white 
            hover:text-white 
            hover:bg-green-600 
            focus-visible:bg-green-600
            focus-visible:outline-green-400;
    }

    &--warning {
        @apply 
            outline
            outline-offset-2
            bg-orange-500 
            text-white 
            hover:text-white 
            hover:bg-orange-600 
            focus-visible:bg-orange-600
            focus-visible:outline-orange-400;
    }
}
</style>