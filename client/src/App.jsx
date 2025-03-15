import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import RegisterForm from "./page/register";
import LoginForm from "./page/login";
import TyreShopHomepage from "./page/main";
import ProfilePage from "./page/profile";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TyreShopHomepage />}/>
        <Route path="/register" element={<RegisterForm />}/>
        <Route path="/login" element={<LoginForm />}/>
        
        {/* Protected Profile Route */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        
        {/* Add other protected routes as needed */}
        <Route 
          path="/appointments" 
          element={
            <ProtectedRoute>
              <div>Appointments Page (Coming Soon)</div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <div>Orders Page (Coming Soon)</div>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;