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
    listenMessage: async (handler: (...args: any[]) => any): Promise<void> => {
        await chrome.runtime.onMessage.addListener(()=>{
            setTimeout(()=>{
                handler()
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
    }
}