<template>
    <form class="pb-20" @submit.prevent="onSubmit">
        <div class="grid grid-cols-2 gap-4">
            <div>
                <div class="mb-2 text-sm">Текст</div>
                <input v-model="fields.text" type="text" class="text-base w-full text-black px-3 py-2 rounded-lg outline-none" placeholder="Текст">
            </div>
            <div>
                <div class="mb-2 text-sm">Other</div>
                <input v-model="fields.other" type="text" class="text-base w-full text-black px-3 py-2 rounded-lg outline-none" placeholder="Текст">
            </div>
        </div>
        <div class="flex items-center justify-center gap-4 fixed bottom-0 left-0 right-0 p-3 bg-gray-600 border-t border-gray-500">
            <Button theme="success" type="submit" icon="search">Начать поиск</Button>
            <Button theme="danger" type="button" icon="cancel">Остановить поиск</Button>
        </div>
    </form>
</template>

<script setup lang="ts">
import Button from '@/components/Button.vue'
import { storageSet } from '@/helpers/storage';
import { storageGet } from '@/helpers/storage';
import { loading } from '@/reactive/useAppLoader';
import { useToast } from '@/reactive/useToast';
import { onBeforeMount, reactive } from 'vue';

const toast = useToast()

const fields = reactive({
    text: '',
    other: ''
})

const onSubmit = async () => {
    await storageSet('text', fields.text)

    loading.value = true

    setTimeout(()=>{
        // loading.value = false
        toast?.show('success', 'Поиск завершен')
        loading.value = false
    }, 2000)
}

onBeforeMount(async ()=>{
    const result = await storageGet('text')
    fields.text = result.text
})
</script>