export async function createTab(url: string): Promise<chrome.tabs.Tab> {
    return new Promise(resolve => {
        chrome.tabs.create({url, active: true}, async tab => {
            chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
                if (info.status === 'complete' && tabId === tab.id) {
                    chrome.tabs.onUpdated.removeListener(listener);
                    resolve(tab);
                }
            });
        });
    });
}

export async function setExtensionTabActive(): Promise<void> {
    const tabs = await chrome.tabs.query({active: false});
    const extensionTab = tabs.find(tab => tab.url?.includes('options.html'))

    if (extensionTab && extensionTab.id) {
        chrome.tabs.update(extensionTab.id, {active: true})
    }
}

export async function wait(timeout: number) {
    return new Promise(resolve => {
        setTimeout(()=>{
            resolve(true)
        }, timeout)
    })
}

export function copyToBuffer(text: string) {
    const textareaElement: HTMLTextAreaElement = document.createElement('textarea')
    textareaElement.style.cssText = 'position: absolute; left: -9999px; top: -9999px;'
    document.body.appendChild(textareaElement);
    textareaElement.value = text
    textareaElement.focus({preventScroll: true});
    textareaElement.select();

    try {
        document.execCommand('copy');
    } catch (error: any) {
        console.error('Ошибка при копировании в буффер', error);
    }

    textareaElement.remove()
}