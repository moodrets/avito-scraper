<template>
    <div 
        class="add-panel select-none fixed right-0 left-0 bottom-0 py-4 bg-gray-700 border-t border-t-gray-500 z-[50] shadow-xl" :class="{'is-open': isOpen}"
        @dblclick="onTogglePanel"
    >
        <div class="centered">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'

const isOpen = ref<boolean>(true)

function onTogglePanel() {
    isOpen.value = !isOpen.value
    chrome.storage.local.set({addPanelIsOpen: isOpen.value})
}

onBeforeMount(async () => {
    const { addPanelIsOpen } = await chrome.storage.local.get('addPanelIsOpen')
    if (addPanelIsOpen !== undefined) {
        isOpen.value = Boolean(addPanelIsOpen)
    }
})
</script>

<style lang="scss">
.add-panel {
    transition: all .2s;
    
    &.is-open {
        @apply border-blue-500;
    }

    &:not(.is-open) {
        transform: translateY(80%);

        &:hover {
            transform: translateY(0);
        }
    }
}
</style>