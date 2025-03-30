import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import RegisterForm from "./page/register";
import LoginForm from "./page/login";
import TyreShopHomepage from "./page/home";
import ProfilePage from "./page/profile";
import ShopPage from "./page/shop";
import ItemDetailsPage from "./page/itemDetails";
import MyGaragesPage from "./page/MyGaragesPage";
import GarageInventoryPage from "./page/GarageInventoryPage";
import EditGaragePage from "./page/EditGaragePage";
import EditInventoryItemPage from "./page/EditInventoryItemPage";
import Checkout from "./page/Checkout";
import CheckoutSuccess from "./page/CheckoutSuccess";

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('userData');

    if (token && storedUserData) {
      setIsLoggedIn(true);
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Clear invalid data
        localStorage.removeItem('userData');
      }
    }
    setAuthLoading(false);
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

  // Protected route component
  const ProtectedRoute = ({ children, requiredRole }) => {
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white">
          <div className="text-xl">Betöltés...</div>
        </div>
      );
    }

    const isAuthenticated = localStorage.getItem('token') !== null;
    const userDataString = localStorage.getItem('userData');
    const userData = userDataString ? JSON.parse(userDataString) : {};

    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }

    // If a specific role is required, check if user has that role
    if (requiredRole && userData.role !== requiredRole) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <ThemeProvider>
      <CartProvider>
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

            {/* Shop Route */}
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

            <Route
              path="/item/:itemId"
              element={
                <ItemDetailsPage
                  setIsLoginOpen={setIsLoginOpen}
                  setIsRegisterOpen={setIsRegisterOpen}
                  isLoggedIn={isLoggedIn}
                  userData={userData}
                  handleLogout={handleLogout}
                />
              }
            />

            {/* Checkout Routes */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout
                    isLoggedIn={isLoggedIn}
                    userData={userData}
                    handleLogout={handleLogout}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/checkout/success"
              element={
                <ProtectedRoute>
                  <CheckoutSuccess
                    isLoggedIn={isLoggedIn}
                    userData={userData}
                    handleLogout={handleLogout}
                  />
                </ProtectedRoute>
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

            {/* Garage Owner Routes */}
            <Route
              path="/my-garages"
              element={
                <ProtectedRoute requiredRole="garage_owner">
                  <MyGaragesPage
                    isLoggedIn={isLoggedIn}
                    userData={userData}
                    handleLogout={handleLogout}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-garages/:garageId/inventory"
              element={
                <ProtectedRoute requiredRole="garage_owner">
                  <GarageInventoryPage
                    isLoggedIn={isLoggedIn}
                    userData={userData}
                    handleLogout={handleLogout}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-garages/:garageId/edit"
              element={
                <ProtectedRoute requiredRole="garage_owner">
                  <EditGaragePage
                    isLoggedIn={isLoggedIn}
                    userData={userData}
                    handleLogout={handleLogout}
                  />
                </ProtectedRoute>
              }
            />

            {/* New route for editing inventory items */}
            <Route
              path="/my-garages/:garageId/inventory/:itemId/edit"
              element={
                <ProtectedRoute requiredRole="garage_owner">
                  <EditInventoryItemPage
                    isLoggedIn={isLoggedIn}
                    userData={userData}
                    handleLogout={handleLogout}
                  />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;