// frontend/src/App.jsx
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Importamos nossas duas telas principais: Login e o Layout
import LoginPage from './pages/LoginPage';
import MainLayout from './components/MainLayout';

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