export function getDateYesterday() {
    let date = new Date()
    return date.setDate(date.getDate() - 1)
}

export function toLocaleString(date: number | Date | null | undefined) {
    if (!date) return
    return new Date(date).toLocaleString('ru-RU')
}