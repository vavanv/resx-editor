const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping'),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  saveFileDialog: (defaultPath: string) => ipcRenderer.invoke('save-file-dialog', defaultPath),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, content: string) => 
    ipcRenderer.invoke('write-file', { filePath, content })
});

// Export type for TypeScript
const electronAPI = {
  ping: (): Promise<string> => ipcRenderer.invoke('ping'),
  openFileDialog: (): Promise<string | null> => ipcRenderer.invoke('open-file-dialog'),
  saveFileDialog: (defaultPath: string): Promise<string | null> => ipcRenderer.invoke('save-file-dialog', defaultPath),
  readFile: (filePath: string): Promise<{ success: boolean; data?: string; error?: string }> => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, content: string): Promise<{ success: boolean; error?: string }> => 
    ipcRenderer.invoke('write-file', { filePath, content })
};

type ElectronAPI = typeof electronAPI;

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// This makes the file a module
export {};