async function afterDOMLoaded(){
    // await BROWSER.listenMessage((request: any, sender: any, sendResponse: any)=>{
    //     console.log(request, sender, sendResponse);
    //     BROWSER.sendMessage({some: 'samsa'}, 'content')
    // })
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', afterDOMLoaded)
} else {
    afterDOMLoaded()
}