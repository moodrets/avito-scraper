export async function createTab(url: string): Promise<chrome.tabs.Tab> {
    return new Promise(resolve => {
        chrome.tabs.create({url, active: false}, async tab => {
            chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
                if (info.status === 'complete' && tabId === tab.id) {
                    chrome.tabs.onUpdated.removeListener(listener);
                    resolve(tab);
                }
            });
        });
    });
}