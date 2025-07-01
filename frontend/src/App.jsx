// src/App.jsx
import { AppBar, Box, CssBaseline, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import { Routes, Route, Link as RouterLink, useLocation, Navigate, useNavigate } from 'react-router-dom';

// Nossos componentes
import LoginPage from './pages/LoginPage';
import ClientListPage from './pages/ClientListPage';
import ClientCreatePage from './pages/ClientCreatePage';
import ClientEditPage from './pages/ClientEditPage';
import Footer from './components/Footer'; // ⬅️ Importamos o novo rodapé

const drawerWidth = 240;

// Componente do Layout Principal
function MainLayout() {
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
            Administrador Profissional
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
            <ListItemButton component={RouterLink} to="/clients" selected>
              <ListItemIcon><PeopleIcon /></ListItemIcon>
              <ListItemText primary="Clientes" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      {/* Container principal modificado para incluir o rodapé */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {/* Box para o conteúdo crescer e empurrar o rodapé para baixo */}
        <Box sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/clients" element={<ClientListPage />} />
            <Route path="/clients/new" element={<ClientCreatePage />} />
            <Route path="/clients/edit/:id" element={<ClientEditPage />} />
            <Route path="/" element={<Navigate to="/clients" />} /> 
          </Routes>
        </Box>
        {/* Nosso novo rodapé */}
        <Footer />
      </Box>
    </Box>
  );
}

// Componente principal que decide qual layout mostrar
function App() {
  const location = useLocation();
  const token = localStorage.getItem('authToken');

  if (!token && location.pathname !== '/login') {
    return <Navigate to="/login" />;
  }
  
  if (token && location.pathname === '/login') {
    return <Navigate to="/" />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<MainLayout />} />
    </Routes>
  );
}

export default App;