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
import SuperadminDashboard from './pages/SuperadminDashboard';
import SuperadminLayout from './components/SuperadminLayout';
import TransporterDetails from './pages/TransporterDetails';
import SuperadminUsers from './pages/SuperadminUsers';
import SuperadminUserDetails from './pages/SuperadminUserDetails';
import SuperadminSettings from './pages/SuperadminSettings';
import SuperadminAnalytics from './pages/SuperadminAnalytics';
import SuperadminTransporters from './pages/SuperadminTransporters';
import SuperadminEditTransporter from './pages/SuperadminEditTransporter';
import SuperadminTransporterDetails from './pages/SuperadminTransporterDetails';
import SuperadminShipments from './pages/SuperadminShipments';
import SuperadminShipmentDetails from './pages/SuperadminShipmentDetails';
import Employees from './pages/Employees';
import Expenses from './pages/Expenses';
import AddEmployee from './pages/AddEmployee';
import EmployeeDetails from './pages/EmployeeDetails';
import EditEmployee from './pages/EditEmployee';
import AddExpense from './pages/AddExpense';
import EditExpense from './pages/EditExpense';
import ExpenseDetails from './pages/ExpenseDetails';
import ProfitLoss from './pages/ProfitLoss';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { fontSize: '1rem', borderRadius: '10px' } }} />
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
          {/* P&L: SUPERADMIN, ADMIN */}
          <Route path="/profit-loss" element={
            <ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN"]}>
              <ProfitLoss />
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
          {/* Vehicles: SUPERADMIN, ADMIN, DISPATCHER */}
          <Route path="/vehicles" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN","DISPATCHER"]}><Vehicles /></ProtectedRoute>} />
          <Route path="/vehicles/new" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN","DISPATCHER"]}><AddVehicle /></ProtectedRoute>} />
          <Route path="/vehicles/:id" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN","DISPATCHER"]}><VehicleDetails /></ProtectedRoute>} />
          <Route path="/vehicles/:id/edit" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN","DISPATCHER"]}><EditVehicle /></ProtectedRoute>} />
          {/* Drivers: SUPERADMIN, ADMIN, DISPATCHER */}
          <Route path="/drivers" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN","DISPATCHER"]}><Drivers /></ProtectedRoute>} />
          <Route path="/drivers/new" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN","DISPATCHER"]}><AddDriver /></ProtectedRoute>} />
          <Route path="/drivers/:id" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN","DISPATCHER"]}><DriverDetails /></ProtectedRoute>} />
          <Route path="/drivers/:id/edit" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN","DISPATCHER"]}><EditDriver /></ProtectedRoute>} />
          {/* Employees: SUPERADMIN, ADMIN */}
          <Route path="/employees" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN"]}><Employees /></ProtectedRoute>} />
          <Route path="/employees/new" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN"]}><AddEmployee /></ProtectedRoute>} />
          <Route path="/employees/:id" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN"]}><EmployeeDetails /></ProtectedRoute>} />
          <Route path="/employees/:id/edit" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN"]}><EditEmployee /></ProtectedRoute>} />
          {/* Expenses: SUPERADMIN, ADMIN */}
          <Route path="/expenses" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN"]}><Expenses /></ProtectedRoute>} />
          <Route path="/expenses/new" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN"]}><AddExpense /></ProtectedRoute>} />
          <Route path="/expenses/:id" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN"]}><ExpenseDetails /></ProtectedRoute>} />
          <Route path="/expenses/:id/edit" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN"]}><EditExpense /></ProtectedRoute>} />
          {/* Add User: SUPERADMIN and ADMIN */}
          <Route path="/add-user" element={<ProtectedRoute allowedRoles={["SUPERADMIN","ADMIN"]}><AddUser /></ProtectedRoute>} />
          {/* Profile and Account Settings: All authenticated users */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/account-settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
          
          {/* Superadmin Routes */}
          <Route path="/superadmin" element={
            <ProtectedRoute requiredRole="SUPERADMIN">
              <SuperadminLayout>
                <SuperadminDashboard />
              </SuperadminLayout>
            </ProtectedRoute>
          } />
          <Route path="/superadmin/transporters" element={
            <ProtectedRoute requiredRole="SUPERADMIN">
              <SuperadminLayout>
                <SuperadminTransporters />
              </SuperadminLayout>
            </ProtectedRoute>
          } />
          <Route path="/superadmin/users" element={
            <ProtectedRoute requiredRole="SUPERADMIN">
              <SuperadminLayout>
                <SuperadminUsers />
              </SuperadminLayout>
            </ProtectedRoute>
          } />
          <Route path="/superadmin/users/:id" element={
            <ProtectedRoute requiredRole="SUPERADMIN">
              <SuperadminLayout>
                <SuperadminUserDetails />
              </SuperadminLayout>
            </ProtectedRoute>
          } />
          <Route path="/superadmin/analytics" element={
            <ProtectedRoute requiredRole="SUPERADMIN">
              <SuperadminLayout>
                <SuperadminAnalytics />
              </SuperadminLayout>
            </ProtectedRoute>
          } />
          <Route path="/superadmin/settings" element={
            <ProtectedRoute requiredRole="SUPERADMIN">
              <SuperadminLayout>
                <SuperadminSettings />
              </SuperadminLayout>
            </ProtectedRoute>
          } />
          <Route path="/superadmin/transporters/:id" element={
            <ProtectedRoute requiredRole="SUPERADMIN">
              <SuperadminLayout>
                <SuperadminTransporterDetails />
              </SuperadminLayout>
            </ProtectedRoute>
          } />
          <Route path="/superadmin/transporters/:id/edit" element={
            <ProtectedRoute requiredRole="SUPERADMIN">
              <SuperadminLayout>
                <SuperadminEditTransporter />
              </SuperadminLayout>
            </ProtectedRoute>
          } />
          <Route path="/superadmin/transporters/new" element={
            <ProtectedRoute requiredRole="SUPERADMIN">
              <SuperadminLayout>
                <SuperadminEditTransporter />
              </SuperadminLayout>
            </ProtectedRoute>
          } />
          <Route path="/superadmin/shipments" element={
            <ProtectedRoute requiredRole="SUPERADMIN">
              <SuperadminLayout>
                <SuperadminShipments />
              </SuperadminLayout>
            </ProtectedRoute>
          } />
          <Route path="/superadmin/shipments/:id" element={
            <ProtectedRoute requiredRole="SUPERADMIN">
              <SuperadminLayout>
                <SuperadminShipmentDetails />
              </SuperadminLayout>
            </ProtectedRoute>
          } />
          <Route path="/superadmin/shipments/:id/edit" element={
            <ProtectedRoute requiredRole="SUPERADMIN">
              <SuperadminLayout>
                <EditShipment />
              </SuperadminLayout>
            </ProtectedRoute>
          } />
          <Route path="/superadmin/shipments/new" element={
            <ProtectedRoute requiredRole="SUPERADMIN">
              <SuperadminLayout>
                <AddShipment />
              </SuperadminLayout>
            </ProtectedRoute>
          } />
          {/* Profit Loss: ADMIN and SUPERADMIN */}
          <Route path="/profit-loss" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}><ProfitLoss /></ProtectedRoute>} />
          
          {/* Add other routes as needed, using allowedRoles/requiredRole for protection */}
        </Routes>
      </Router>
    </>
  )
}

export default App;