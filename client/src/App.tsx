import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import "./App.css";

function App() {
  // Sementara auth disimulasikan sebagai 'true' agar kita bisa melihat halaman dashboard.
  // Nantinya ini akan menggunakan useAuthStore.
  const isAuthenticated = true;

  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
