import { AppBar, Box, CssBaseline, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import { Routes, Route, Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';

import ClientSearchPage from '../pages/ClientSearchPage';
import ClientManagerPage from '../pages/ClientManagerPage';
import Footer from './Footer';

const drawerWidth = 240;

export default function MainLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <img src="/logo.png" alt="Admin Pro Logo" style={{ height: '40px', marginRight: '16px' }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Admin Pro
          </Typography>
          <IconButton color="inherit" onClick={handleLogout} aria-label="logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' } }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItemButton component={RouterLink} to="/clients">
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Painel" />
            </ListItemButton>
            <ListItemButton component={RouterLink} to="/clients/search">
              <ListItemIcon><PeopleIcon /></ListItemIcon>
              <ListItemText primary="Clientes" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<ClientManagerPage mode="create" />} />
            <Route path="/clients" element={<ClientManagerPage mode="create" />} />
            <Route path="/clients/search" element={<ClientSearchPage />} />
            <Route path="/clients/edit/:id" element={<ClientManagerPage mode="edit" />} />
          </Routes>
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}