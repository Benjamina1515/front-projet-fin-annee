import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './utils/constants';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import ProfessorLayout from './layouts/ProfessorLayout';
import StudentLayout from './layouts/StudentLayout';

// Pages publiques
import Login from './pages/Login';

// Pages Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';

// Pages Professeur
import ProfessorDashboard from './pages/professor/ProfessorDashboard';

// Pages Étudiant
import StudentDashboard from './pages/student/StudentDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Route publique */}
          <Route path="/login" element={<Login />} />

          {/* Routes Admin */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="projects" element={<div>Gestion des Projets (À implémenter)</div>} />
            <Route path="settings" element={<div>Paramètres (À implémenter)</div>} />
          </Route>

          {/* Routes Professeur */}
          <Route
            path="/professor/*"
            element={
              <ProtectedRoute allowedRoles={[ROLES.PROFESSOR]}>
                <ProfessorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ProfessorDashboard />} />
            <Route path="projects" element={<div>Mes Projets (À implémenter)</div>} />
            <Route path="evaluations" element={<div>Évaluations (À implémenter)</div>} />
            <Route path="students" element={<div>Mes Étudiants (À implémenter)</div>} />
          </Route>

          {/* Routes Étudiant */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="projects" element={<div>Mes Projets (À implémenter)</div>} />
            <Route path="tasks" element={<div>Mes Tâches (À implémenter)</div>} />
            <Route path="reports" element={<div>Mes Tâches (À implémenter)</div>} />
          </Route>

          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
