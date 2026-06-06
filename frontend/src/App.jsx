import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Chat from './pages/Chat';
import Login from './pages/Login';
import TimeReports from './pages/TimeReports';

// Componente guardián que verifica si hay token
const PrivateRoute = ({ children }) => {
  const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJFbnJpcXVlIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzgwNzY1Nzg2LCJleHAiOjE3ODA4NTIxODZ9.T1M-2S6B-baGvf-Mj56plGm1HuneijGG6qL33rHRuIU";
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />

        {/* Rutas privadas (Protegidas por PrivateRoute) */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="chat" element={<Chat />} />
          <Route path="/time-reports" element={<TimeReports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;