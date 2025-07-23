import { Routes, Route, Navigate } from 'react-router-dom';
import StoreManagerDashboard from './StoreManagerDashboard';
import CreateMedicationOrderPage from './CreateMedicationOrderPage';

export default function StoreManagementRoutes() {
    return (
        <Routes>
            <Route path="/" element={<StoreManagerDashboard />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<StoreManagerDashboard />} />
                <Route path="orders" element={<StoreManagerDashboard />} />
                <Route path="inventory" element={<StoreManagerDashboard />} />
                <Route path="products" element={<StoreManagerDashboard />} />
                <Route path="messages" element={<StoreManagerDashboard />} />
                <Route path="profile" element={<StoreManagerDashboard />} />
                <Route path="medication-pickup" element={<CreateMedicationOrderPage />} />
            </Route>
        </Routes>
    );
}
