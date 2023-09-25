import { reactive } from "vue"

class ProfilesSavedFilter {
    public fields = reactive<{
        name: string,
        comment: string,
    }>({
        name: '',
        comment: ''
    })
}

export const profilesSavedFilter = new ProfilesSavedFilter()