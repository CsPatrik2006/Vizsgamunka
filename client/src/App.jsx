import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider } from './context/ThemeContext';
import RegisterForm from "./page/register";
import LoginForm from "./page/login";
import TyreShopHomepage from "./page/main";
import ProfilePage from "./page/profile";
import ShopPage from "./page/shop"; // Import the new shop page

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('userData');

    if (token && storedUserData) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  const handleLoginSuccess = (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(user));
    setIsLoggedIn(true);
    setUserData(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
    setUserData(null);
  };

  return (
    <ThemeProvider>
      <Router>
        {isLoginOpen && (
          <LoginForm
            isOpen={isLoginOpen}
            onClose={() => setIsLoginOpen(false)}
            setIsRegisterOpen={setIsRegisterOpen}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {isRegisterOpen && (
          <RegisterForm
            isOpen={isRegisterOpen}
            onClose={() => setIsRegisterOpen(false)}
            setIsLoginOpen={setIsLoginOpen}
          />
        )}

        <Routes>
          <Route
            path="/"
            element={
              <TyreShopHomepage
                setIsLoginOpen={setIsLoginOpen}
                setIsRegisterOpen={setIsRegisterOpen}
                isLoggedIn={isLoggedIn}
                userData={userData}
                handleLogout={handleLogout}
              />
            }
          />

          {/* New Shop Route */}
          <Route
            path="/shop"
            element={
              <ShopPage
                setIsLoginOpen={setIsLoginOpen}
                setIsRegisterOpen={setIsRegisterOpen}
                isLoggedIn={isLoggedIn}
                userData={userData}
                handleLogout={handleLogout}
              />
            }
          />

          {/* Protected Profile Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage
                  isLoggedIn={isLoggedIn}
                  userData={userData}
                  handleLogout={handleLogout}
                />
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
    </ThemeProvider>
  );
}

export default App;