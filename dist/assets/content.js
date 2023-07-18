chrome.runtime.onMessage.addListener(e=>{e.action==="parsing-start"&&chrome.runtime.sendMessage({toastType:"success",toastText:"Парсинг пошел, дорогой"})});
