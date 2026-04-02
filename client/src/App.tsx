import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { UserManagementPage } from "./pages/UserManagementPage";
import { useAuth } from "./hooks/useAuth";
import "./App.css";

function App() {
  const { isAuthenticated, user, refreshAuth } = useAuth();

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} 
      />
      
      <Route 
        path="/" 
        element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />} 
      />
      
      <Route 
        path="/project/:id" 
        element={isAuthenticated ? <ProjectDetailPage /> : <Navigate to="/login" replace />} 
      />

      <Route 
        path="/users" 
        element={
          isAuthenticated && user?.role === 'superadmin' 
            ? <UserManagementPage /> 
            : <Navigate to="/" replace />
        } 
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
