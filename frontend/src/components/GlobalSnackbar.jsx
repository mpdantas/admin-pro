// src/components/GlobalSnackbar.jsx
import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import useNotificationStore from '../stores/notificationStore';

export default function GlobalSnackbar() {
  const { open, message, severity, hideNotification } = useNotificationStore();

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    hideNotification();
  };

  return (
    <Snackbar 
      open={open} 
      autoHideDuration={6000} // A notificação some após 6 segundos
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} // Posição na tela
    >
      <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}