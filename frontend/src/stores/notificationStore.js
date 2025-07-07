// src/stores/notificationStore.js
import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  open: false,
  message: '',
  severity: 'success', // pode ser 'success', 'error', 'warning', 'info'

  showNotification: (config) => set({
    open: true,
    message: config.message,
    severity: config.severity || 'success',
  }),

  hideNotification: () => set({
    open: false,
  }),
}));

export default useNotificationStore;