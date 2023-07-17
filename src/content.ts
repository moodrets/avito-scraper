function getAllCategories(){
    const result: {url: string, text: string}[] = []
    const categoriesFirstLevel = document.querySelectorAll(`${SELECTORS.CATEGORY_ITEM_LEVEL_1} a`)

    if (!categoriesFirstLevel.length) {
        BROWSER.sendMessage({
            toastType: 'error',
            toastText: 'Не найдены категории первого уровня'
        }, 'content')
        return
    }

    categoriesFirstLevel.forEach((item: any) => {
        result.push({
            url: item.href,
            text: item.textContent
        })
    })
}

function afterDOMLoaded(){
    BROWSER.listenMessage((request: any) => {
        if (request.state === 'loadFirst') {
            
        }
    })
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', afterDOMLoaded)
} else {
    afterDOMLoaded()
}