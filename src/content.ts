chrome.runtime.onMessage.addListener((request: any) => {
    if (request.action === 'parsing-start') {
        chrome.runtime.sendMessage({
            action: 'parsing-started',
            toastType: 'success', 
            toastText: 'Парсинг пошел, дорогой'
        });
    }
})