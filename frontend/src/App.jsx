import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/MainLayout';
import GlobalSnackbar from './components/GlobalSnackbar';

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
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<MainLayout />} />
      </Routes>
      <GlobalSnackbar />
    </>
  );
}

export default App;