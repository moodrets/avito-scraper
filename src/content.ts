chrome.runtime.onMessage.addListener((request: any) => {
    if (request.action === 'parsing-start') {
        chrome.runtime.sendMessage({toastType: 'success', toastText: 'Парсинг пошел, дорогой'});
    }
})