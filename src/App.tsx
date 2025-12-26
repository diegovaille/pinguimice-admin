import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Stock from './pages/Stock';
import Clients from './pages/Clients';
import Production from './pages/Production';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Sabores from './pages/Sabores';
import Regioes from './pages/Regioes';
import ExpenseReport from './pages/reports/ExpenseReport';
import SalesReport from './pages/reports/SalesReport';
import StockReport from './pages/reports/StockReport';
import ProductionReport from './pages/reports/ProductionReport';
import ProfitReport from './pages/reports/ProfitReport';
import CalculationParameters from './pages/CalculationParameters';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock"
            element={
              <ProtectedRoute>
                <Stock />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/production"
            element={
              <ProtectedRoute>
                <Production />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <Sales />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <Expenses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/expenses"
            element={
              <ProtectedRoute>
                <ExpenseReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/sales"
            element={
              <ProtectedRoute>
                <SalesReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/stock"
            element={
              <ProtectedRoute>
                <StockReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/production"
            element={
              <ProtectedRoute>
                <ProductionReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/profit"
            element={
              <ProtectedRoute>
                <ProfitReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sabores"
            element={
              <ProtectedRoute>
                <Sabores />
              </ProtectedRoute>
            }
          />
          <Route
            path="/regioes"
            element={
              <ProtectedRoute>
                <Regioes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parameters"
            element={
              <ProtectedRoute>
                <CalculationParameters />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
