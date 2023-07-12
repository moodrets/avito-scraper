function afterDOMLoaded(){
    setTimeout(()=>{
        const categoriesButton: HTMLElement | null = document.querySelector('[data-marker="top-rubricator/root-category-25984"]')
        categoriesButton?.click()
        console.log(categoriesButton);
    }, 300)
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', afterDOMLoaded)
} else {
    afterDOMLoaded()
}