import { IFilterFields } from "@/types/interfaces";
import { reactive } from "vue";

export const filterFields = reactive<IFilterFields>({
    profilesLinks: [
        {url: '', status: 'wait'},
    ],
    productName: '',
    dateFrom: '',
    dateTo: '',
    ratingFrom: 4,
    ratingTo: 5,
    interval: 2,
    deliveryOnly: false,
})