chrome.runtime.onMessage.addListener(e=>{e.action==="parsing-start"&&chrome.runtime.sendMessage({action:"parsing-started",toastType:"success",toastText:"Парсинг отзывов начался"})});
