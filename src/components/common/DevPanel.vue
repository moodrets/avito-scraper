<template>
    <div class="fixed z-100 right-0 left-0 bottom-0 p-3 bg-gray-600 shadow-xl border-t-2 border-t-white">
        <div class="centered">
            <div class="flex items-center gap-4">
                <Button 
                    theme="info" 
                    icon="assessment" 
                    @click.stop="onLog"
                ></Button>
                <Button 
                    theme="danger" 
                    icon="assessment" 
                    @click.stop="onClearStorage"
                ></Button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Button from '@/components/common/Button.vue'

async function onLog() {
    console.log(await chrome.storage.local.get())
}

async function onClearStorage() {
    await chrome.storage.local.clear()
}
</script>