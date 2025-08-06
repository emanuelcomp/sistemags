import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth.jsx';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profissionais from './pages/Profissionais';
import ProfissionalForm from './pages/ProfissionalForm';
import Equipamentos from './pages/Equipamentos';
import Cidades from './pages/Cidades';
import Usuarios from './pages/Usuarios';
import Auditoria from './pages/Auditoria';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/profissionais" element={<Profissionais />} />
                    <Route path="/profissionais/novo" element={<ProfissionalForm />} />
                    <Route path="/profissionais/editar/:id" element={<ProfissionalForm />} />
                    <Route path="/equipamentos" element={<Equipamentos />} />
                    <Route path="/cidades" element={<ProtectedRoute requiredLevel={3}><Cidades /></ProtectedRoute>} />
                    <Route path="/usuarios" element={<ProtectedRoute requiredLevel={3}><Usuarios /></ProtectedRoute>} />
                    <Route path="/auditoria" element={<ProtectedRoute requiredLevel={3}><Auditoria /></ProtectedRoute>} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
