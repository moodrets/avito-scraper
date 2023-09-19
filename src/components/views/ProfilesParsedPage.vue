<template>
    <ProfilesParseFilter></ProfilesParseFilter>
    <ProfilesParsedList></ProfilesParsedList>
    <AddPanel>
        <Button
            v-if="profilesParsedList.list.value.length > 1"
            theme="success" 
            type="button"
            icon="remove_red_eye"
            @click.stop.prevent="onViewAll"
            class="ml-auto"
        >Все результаты</Button>
        <Button
            v-if="profilesParsedList.list.value.length > 1"
            theme="success" 
            type="button"
            icon="remove_red_eye"
            @click.stop.prevent="onViewMoreThan"
        > >= 10</Button>
        <Button
            theme="info"
            type="button"
            icon="close_fullscreen"
            icon-class="-rotate-45"
            @click="onCloseAllProfiles"
        >
        </Button>
        <Button
            theme="info"
            type="button"
            icon="double_arrow"
            icon-class="-rotate-90"
            @click="onScrollToLast"
        >
        </Button>
        <Checkbox
            :checked="profilesParsedList.hasChecked()" 
            @change="onCheckAll"
        ></Checkbox>
    </AddPanel>
</template>

<script setup lang="ts">
import ProfilesParseFilter from '@/components/filters/ProfilesParseFilter.vue'
import ProfilesParsedList from '@/components/list/ProfilesParsedList.vue'
import AddPanel from '@/components/common/AddPanel.vue'
import Button from '@/components/common/Button.vue'
import Checkbox from '@/components/common/Checkbox.vue'
import { profilesParsedList } from '@/reactive/useProfilesParsedList'
import { reviewsFilter } from '@/reactive/useReviewsFilter'

function onCloseAllProfiles() { 
    profilesParsedList.closeAllProfiles()
}

function onScrollToLast() {
    reviewsFilter.profileLinkScrollToLast()
}

function onCheckAll(checked: boolean) {
    profilesParsedList.list.value.forEach(profile => {
        if (checked) {
            profilesParsedList.state.checkedItems[profile.url] = profile
        } else {
            delete profilesParsedList.state.checkedItems[profile.url]
        }
    })
}

async function onViewAll() {
    profilesParsedList.state.contentModalVisible = true
    profilesParsedList.state.contentModalData = profilesParsedList.getAllResults()
}

async function onViewMoreThan() {
    profilesParsedList.state.contentModalVisible = true
    profilesParsedList.state.contentModalData = profilesParsedList.getMoreThanResults()
}
</script>