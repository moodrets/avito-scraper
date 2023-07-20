<template>
    <div class="switch">
        <input
            v-if="type === 'checkbox'"
            type="checkbox"
            :tabindex="tabindex"
            :checked="modelValue"
            @change="onChange"
        >
        <input 
            v-if="type === 'radio'"
            type="radio" 
            :tabindex="tabindex"
            :checked="modelValue"
            @change="onChange"
        >
        <div class="switch__label"></div>
    </div>
</template>

<script setup lang="ts">
withDefaults(
    defineProps<{
        type?: 'checkbox' | 'radio',
        modelValue: any,
        tabindex?: number
    }>(),
    {
        type: 'checkbox',
    }
)

const emits = defineEmits(['update:modelValue'])

const onChange = (event: Event) => {
    emits('update:modelValue', (event.target as HTMLInputElement).checked)
}
</script>

<style lang="scss">
.switch {
    --translate-x: 0;
    --translate-y: -50%;

    width: 54px;
    height: 26px;
    position: relative;

    input {
        @apply p-0 m-0 outline-none opacity-0 w-full h-full cursor-pointer;
    }

    .switch__label {
        @apply w-full h-full bg-gray-500 rounded-3xl pointer-events-none absolute inset-0;
        transition: background .2s;

        &:before {
            content: '';
            position: absolute;
            width: 20px;
            height: 75%;
            left: 4px;
            top: 50%;
            transform: translate(var(--translate-x), var(--translate-y));
            box-shadow: 0 0 4px rgba(0,0,0,.5);
            transition: transform .2s;
            @apply bg-white bg-opacity-50 rounded-full;
        }
    }

    input:focus-visible ~ .switch__label {
        @apply outline outline-offset-2 outline-blue-500;
    }

    input:checked ~ .switch__label {
        --translate-x: 26px;
        @apply bg-green-500;

        &:before {
            @apply bg-opacity-100;
        }
    }
}
</style>