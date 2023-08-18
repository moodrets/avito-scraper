<template>
    <div
        class="flex items-center cursor-pointer select-none whitespace-nowrap" 
        @click="onSort"
    >
        <div 
            class="font-icon mr-2" 
            :class="[
                {'text-cyan-400': props.sortTypes.includes(props.currentSortType)},
                {'rotate-180': rotateIcon}
            ]">sort</div>
        <div>{{ props.label }}</div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
    defineProps<{
        currentSortType: string,
        sortTypes: string[],
        label: string
    }>(),
    {
        currentSortType: '',
        sortTypes: () => [],
        label: '',
    }
)

const rotateIcon = computed<boolean>(() => {
    if (props.sortTypes.includes(props.currentSortType) && props.currentSortType.includes('asc')) {
        return true
    }
    return false
})

const emits = defineEmits(['sort'])

function onSort() {
    if (props.currentSortType.includes('desc')) {
        emits('sort', props.sortTypes.find(type => type.includes('asc')))
    } else {
        emits('sort', props.sortTypes.find(type => type.includes('desc')))
    }
}
</script>