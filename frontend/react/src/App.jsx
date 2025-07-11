import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import Shipments from './pages/Shipments';
import AddShipment from './pages/AddShipment';
import ShipmentDetails from './pages/ShipmentDetails';
import EditShipment from './pages/EditShipment';
import Vehicles from './pages/Vehicles';
import AddVehicle from './pages/AddVehicle';
import VehicleDetails from './pages/VehicleDetails';
import EditVehicle from './pages/EditVehicle';
import Drivers from './pages/Drivers';
import AddDriver from './pages/AddDriver';
import DriverDetails from './pages/DriverDetails';
import EditDriver from './pages/EditDriver';
import AddUser from './pages/AddUser';
import Profile from './pages/Profile';
import AccountSettings from './pages/AccountSettings';
import Analytics from './pages/Analytics.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Dashboard: All roles */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/analytics" element={
          <ProtectedRoute roles={["SUPERADMIN", "ADMIN", "DISPATCHER"]}>
            <Analytics />
          </ProtectedRoute>
        } />
        {/* Shipments: All roles */}
        <Route path="/shipments" element={<ProtectedRoute><Shipments /></ProtectedRoute>} />
        {/* Shipment Details: All roles */}
        <Route path="/shipments/:id" element={<ProtectedRoute><ShipmentDetails /></ProtectedRoute>} />
        {/* Add Shipment: SUPERADMIN, ADMIN, DISPATCHER */}
        <Route path="/shipments/new" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN","DISPATCHER"]}><AddShipment /></ProtectedRoute>} />
        {/* Shipment Edit: SUPERADMIN, ADMIN, DISPATCHER */}
        <Route path="/shipments/:id/edit" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN","DISPATCHER"]}><EditShipment /></ProtectedRoute>} />
        {/* Vehicles: SUPERADMIN, ADMIN */}
        <Route path="/vehicles" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN"]}><Vehicles /></ProtectedRoute>} />
        <Route path="/vehicles/new" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN"]}><AddVehicle /></ProtectedRoute>} />
        <Route path="/vehicles/:id" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN"]}><VehicleDetails /></ProtectedRoute>} />
        <Route path="/vehicles/:id/edit" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN"]}><EditVehicle /></ProtectedRoute>} />
        {/* Drivers: SUPERADMIN, ADMIN */}
        <Route path="/drivers" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN"]}><Drivers /></ProtectedRoute>} />
        <Route path="/drivers/new" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN"]}><AddDriver /></ProtectedRoute>} />
        <Route path="/drivers/:id" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN"]}><DriverDetails /></ProtectedRoute>} />
        <Route path="/drivers/:id/edit" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN"]}><EditDriver /></ProtectedRoute>} />
        {/* Add User: SUPERADMIN only */}
        <Route path="/add-user" element={<ProtectedRoute requiredRole="SUPERADMIN"><AddUser /></ProtectedRoute>} />
        {/* Profile and Account Settings: All authenticated users */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/account-settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
        {/* Add other routes as needed, using allowedRoles/requiredRole for protection */}
      </Routes>
    </Router>
  )
}

export default App;