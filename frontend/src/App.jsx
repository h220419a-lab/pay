import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useAuth } from "./hooks/useAuth";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import OrdersPage from "./pages/OrdersPage";
import PaymentReturnPage from "./pages/PaymentReturnPage";
import RegisterPage from "./pages/RegisterPage";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return user?.role === "Admin" ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route path="/payment/return" element={<PaymentReturnPage />} />
        </Routes>
      </main>
    </div>
  );
}
