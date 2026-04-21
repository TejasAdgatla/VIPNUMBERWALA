import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import VIPNumbersPage from './pages/VIPNumbersPage';
import NumerologyPage from './pages/NumerologyPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutStatusPage from './pages/CheckoutStatusPage';
import ProfilePage from './pages/ProfilePage';
import AdminPortal from './components/AdminPortal';
import AdminLogin from './components/AdminLogin';
import { NumbersProvider } from './context/NumbersContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './index.css';

const AdminRoute = () => {
  const { user } = useAuth();
  return user?.is_admin ? <AdminPortal /> : <AdminLogin />;
};

function App() {
  return (
    <AuthProvider>
      <NumbersProvider>
        <CartProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/vip-numbers" element={<VIPNumbersPage />} />
                <Route path="/numerology" element={<NumerologyPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/checkout/status" element={<CheckoutStatusPage />} />
                <Route path="/central-vault" element={<AdminRoute />} />
                <Route path="/admin" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </CartProvider>
      </NumbersProvider>
    </AuthProvider>
  );
}

export default App;
