import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
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
import GarageOrdersPage from "./page/GarageOrders";
import GarageAppointmentSchedulePage from "./page/GarageAppointmentSchedulePage";
import Impresszum from './page/Impresszum';
import ASZF from './page/ASZF';
import Adatvedelem from "./page/Adatvedelem";

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      if (payload.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
      }
      return false;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('userData');

    if (token && storedUserData) {
      if (isTokenExpired(token)) {
        handleLogout();
      } else {
        setIsLoggedIn(true);
        try {
          setUserData(JSON.parse(storedUserData));
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem('userData');
        }
      }
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const tokenCheckInterval = setInterval(() => {
        const token = localStorage.getItem('token');
        if (token && isTokenExpired(token)) {
          handleLogout();
        }
      }, 60000);

      return () => clearInterval(tokenCheckInterval);
    }
  }, [isLoggedIn]);

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

            <Route
              path="/impresszum"
              element={
                <Impresszum
                  setIsLoginOpen={setIsLoginOpen}
                  setIsRegisterOpen={setIsRegisterOpen}
                  isLoggedIn={isLoggedIn}
                  userData={userData}
                  handleLogout={handleLogout}
                />
              }
            />

            <Route
              path="/aszf"
              element={
                <ASZF
                  setIsLoginOpen={setIsLoginOpen}
                  setIsRegisterOpen={setIsRegisterOpen}
                  isLoggedIn={isLoggedIn}
                  userData={userData}
                  handleLogout={handleLogout}
                />
              }
            />

            <Route
              path="/adatvedelem"
              element={
                <Adatvedelem
                  setIsLoginOpen={setIsLoginOpen}
                  setIsRegisterOpen={setIsRegisterOpen}
                  isLoggedIn={isLoggedIn}
                  userData={userData}
                  handleLogout={handleLogout}
                />
              }
            />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  userData={userData}
                  authLoading={authLoading}
                >
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
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  userData={userData}
                  authLoading={authLoading}
                >
                  <CheckoutSuccess
                    isLoggedIn={isLoggedIn}
                    userData={userData}
                    handleLogout={handleLogout}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  userData={userData}
                  authLoading={authLoading}
                >
                  <ProfilePage
                    isLoggedIn={isLoggedIn}
                    userData={userData}
                    handleLogout={handleLogout}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-garages"
              element={
                <ProtectedRoute
                  requiredRole="garage_owner"
                  isLoggedIn={isLoggedIn}
                  userData={userData}
                  authLoading={authLoading}
                >
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
                <ProtectedRoute
                  requiredRole="garage_owner"
                  isLoggedIn={isLoggedIn}
                  userData={userData}
                  authLoading={authLoading}
                >
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
                <ProtectedRoute
                  requiredRole="garage_owner"
                  isLoggedIn={isLoggedIn}
                  userData={userData}
                  authLoading={authLoading}
                >
                  <EditGaragePage
                    isLoggedIn={isLoggedIn}
                    userData={userData}
                    handleLogout={handleLogout}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-garages/:garageId/inventory/:itemId/edit"
              element={
                <ProtectedRoute
                  requiredRole="garage_owner"
                  isLoggedIn={isLoggedIn}
                  userData={userData}
                  authLoading={authLoading}
                >
                  <EditInventoryItemPage
                    isLoggedIn={isLoggedIn}
                    userData={userData}
                    handleLogout={handleLogout}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-garages/:garageId/orders"
              element={
                <ProtectedRoute
                  requiredRole="garage_owner"
                  isLoggedIn={isLoggedIn}
                  userData={userData}
                  authLoading={authLoading}
                >
                  <GarageOrdersPage
                    isLoggedIn={isLoggedIn}
                    userData={userData}
                    handleLogout={handleLogout}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-garages/:garageId/appointments"
              element={
                <ProtectedRoute
                  requiredRole="garage_owner"
                  isLoggedIn={isLoggedIn}
                  userData={userData}
                  authLoading={authLoading}
                >
                  <GarageAppointmentSchedulePage
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