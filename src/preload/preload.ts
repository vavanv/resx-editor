const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping')
});

// Export type for TypeScript
const electronAPI = {
  ping: (): Promise<string> => ipcRenderer.invoke('ping')
};

type ElectronAPI = typeof electronAPI;

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// This makes the file a module
export {};