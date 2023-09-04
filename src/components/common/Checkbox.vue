<template>
    <div class="checkbox" :class="{'disabled': disabled}">
        <input 
            type="checkbox"
            :checked="checked"
            @change="emits('change', ($event.target as HTMLInputElement).checked)"
        >
        <div class="checkbox__label">
            <div class="font-icon">check</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
withDefaults(
    defineProps<{
        disabled?: boolean,
        checked?: boolean,
    }>(),
    {
        disabled: false,
        checked: false
    }
)

const emits = defineEmits(['change'])
</script>

<style lang="scss">
.checkbox {
    @apply relative inline-flex;

    &__label {
        @apply rounded-md relative z-[5] w-6 h-6 pointer-events-none flex items-center justify-center bg-white transition-colors ring-[1px] ring-white;

        .font-icon {
            @apply transition-transform text-[20px] scale-0;
        }
    }

    input {
        @apply absolute inset-x-0 inset-y-0 z-[10] w-full h-full opacity-0 block cursor-pointer;
    }

    input:checked ~ &__label {
        @apply bg-blue-500;

        .font-icon {
            @apply scale-100;
        }
    }

    &.disabled {
        @apply opacity-50;

        * {
            @apply pointer-events-none;
        }
    }
}
</style>