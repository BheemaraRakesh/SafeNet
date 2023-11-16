

import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('scanFile', {
  sendfile: (name: String) => {
    ipcRenderer.send('inputfile', name)
  },
  result: (message: (event: IpcRendererEvent, ...args: any[]) => void) => {
    ipcRenderer.on('messageFromMain', message);
  }
})