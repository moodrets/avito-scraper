export const getDateYesterday = () => {
    let date = new Date()
    return date.setDate(date.getDate() - 1)
}