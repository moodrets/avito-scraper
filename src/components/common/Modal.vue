<template>
    <div 
        ref="modalRef"
        tabindex="0"
        class="app-modal fixed inset-0 bg-black bg-opacity-60 z-100 overflow-y-scroll p-10 flex" 
        @click="onClickHandler"
        @keydown.esc="onClose"
    >
        <div 
            class="app-modal__body relative bg-gray-600 shadow-xl rounded-xl p-10 m-auto max-w-full min-h-[100px] break-all" 
            :style="{'width': props.width}"
        >
            <div class="font-icon absolute right-2 top-2 z-10 cursor-pointer text-3xl" @click="onClose">close</div>
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const modalRef = ref()

const props = withDefaults(
    defineProps<{
        width?: string
    }>(),
    {
        width: '580px'
    }
)

const emits = defineEmits(['close'])

function onClickHandler(event: Event){
    const target = event.target as HTMLElement
    if (!target.classList.contains('app-modal__body') && !target.closest('.app-modal__body')) {
        onClose()
    }
}

function onClose() {
    emits('close')
}

onBeforeUnmount(() => {
    document.body.classList.remove('overflow-hidden')
})

onMounted(() => {
    modalRef?.value?.focus({preventScroll: true})
    document.body.classList.add('overflow-hidden')
})
</script>

<style lang="scss">
.app-modal {
    transform: translate3d(0,0,0);
}
</style>