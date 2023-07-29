export function getDateYesterday() {
    let date = new Date()
    return date.setDate(date.getDate() - 1)
}

export function getDateTwoMonthAgo() {
    let date = new Date()
    return new Date(date.setMonth(date.getMonth()-2));
}

export function toLocaleString(date: number | Date | null | undefined) {
    if (!date) return
    return new Date(date).toLocaleString('ru-RU')
}

export function dateFromDatepickerString(dateSting: string): number {
    let splitString = dateSting.split('.')
    return Date.parse(`${splitString[2]} ${splitString[1]} ${splitString[0]}`)
}