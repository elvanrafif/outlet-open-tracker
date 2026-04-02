import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { useAuth } from "./hooks/useAuth";
import "./App.css";

function App() {
  const { isAuthenticated, refreshAuth } = useAuth();

  // Cek sesi login saat aplikasi pertama kali dibuka
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
      
      {/* Catch all rute */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
