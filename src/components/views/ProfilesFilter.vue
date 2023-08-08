<template>
    <form @submit.prevent="onSubmit()">
        <div class="grid grid-cols-4">
            <div class="col-span-2">
                <div class="mb-2 text-sm font-medium">Дата от</div>
                <input 
                    tabindex="2"
                    required
                    autocomplete="off"
                    type="search"
                    id="dateFrom"
                    class="text-base w-full text-black px-3 py-2 rounded-lg outline-none focus:outline-blue-400"
                >
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">


async function onSubmit(){

}
</script>