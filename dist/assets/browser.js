window.BROWSER={sendMessage:async(e,t)=>{if(t==="popup"){const[a]=await chrome.tabs.query({active:!0,lastFocusedWindow:!0});a&&a.id&&await chrome.tabs.sendMessage(a.id,e)}t==="content"&&await chrome.runtime.sendMessage(e)},listenMessage:e=>{chrome.runtime.onMessage.addListener((...t)=>{setTimeout(()=>{e(...t)},0)})},storageSet:async(e,t)=>await chrome.storage.local.set({[e]:t}),storageGet:async e=>await chrome.storage.local.get(e),storageRemove:async e=>await chrome.storage.local.remove(e),connect:e=>{e?chrome.runtime.connect(e):chrome.runtime.connect()},openTab:e=>{chrome.tabs.create({url:e.url,active:e.active})}};window.SELECTORS={CATEGORY_ITEM_LEVEL_1:".top-rubricator-hide-saN4l"};
