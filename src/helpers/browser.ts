// BROWSER.listenMessage((request: any, sender: any, sendResponse: any) => {
    
// })

(window as any).BROWSER = {
    sendMessage: async (data: any, from: 'popup' | 'content'): Promise<void> => {
        if (from === 'popup') {
            const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
            if (tab && tab.id) {
                await chrome.tabs.sendMessage(tab.id, data);
            }
        }
    
        if (from === 'content') {
            await chrome.runtime.sendMessage(data)
        }
    },
    listenMessage: (handler: (...args: any[]) => any): void => {
        chrome.runtime.onMessage.addListener((...args: any[]) => {
            setTimeout(()=>{
                handler(...args)
            }, 0)
        })
    },
    storageSet: async (key: string, data: any) => {
        return await chrome.storage.local.set({ [key]: data })
    },
    storageGet: async (key: string | string[] | null) => {
        return await chrome.storage.local.get(key)
    },
    storageRemove: async (key: string | string[]) => {
        return await chrome.storage.local.remove(key);
    },
    connect: (data: Record<string, any>): void => {
        data ? chrome.runtime.connect(data) : chrome.runtime.connect() 
    }
};

(window as any).SELECTORS = {
    CATEGORY_ITEM_LEVEL_1: '.top-rubricator-hide-saN4l'
}