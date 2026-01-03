const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  startTyping: (config) => ipcRenderer.send('start-typing', config),
  stopTyping: () => ipcRenderer.send('stop-typing'),
  onTypingStarted: (callback) => ipcRenderer.on('typing-started', callback),
  onTypingStopped: (callback) => ipcRenderer.on('typing-stopped', callback),
  onTypingProgress: (callback) => ipcRenderer.on('typing-progress', callback),
  onTypingError: (callback) => ipcRenderer.on('typing-error', callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

