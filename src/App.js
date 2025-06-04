import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OrderPage from './pages/OrderPage';
import ActiveOrdersPage from './pages/ActiveOrdersPage'; // Import halaman baru

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/order" element={<OrderPage />} />
                <Route path="/active-orders" element={<ActiveOrdersPage />} /> {/* Rute baru */}

                {/* Rute default: arahkan ke login jika belum ada rute yang cocok */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;