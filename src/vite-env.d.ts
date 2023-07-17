/// <reference types="vite/client" />

declare var BROWSER = {
    sendMessage: any,
    listenMessage: any,
    storageSet: any,
    storageGet: any,
    storageRemove: any,
    connect: (data?: Record<string, any>): void => {}
};

declare var SELECTORS: Record<string, string> = {
    [string]: string
}