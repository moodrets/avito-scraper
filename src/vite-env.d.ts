/// <reference types="vite/client" />

declare var BROWSER: {
    sendMessage: any,
    listenMessage: any,
    storageSet: any,
    storageGet: any,
    storageRemove: any
};