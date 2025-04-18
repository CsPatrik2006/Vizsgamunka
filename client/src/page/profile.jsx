import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import Header from "../components/ui/navbar";
import { motion, AnimatePresence } from "framer-motion";
import logo_light from '../assets/logo_lightMode.png';
import logo_dark from '../assets/logo_darkMode.png';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import Footer from "../components/ui/Footer";

const ProfilePage = ({ isLoggedIn, userData, handleLogout }) => {
  const { darkMode, themeLoaded } = useTheme();
  const { handleCartLogout } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [deleteMessage, setDeleteMessage] = useState({ type: '', text: '' });

  const [validations, setValidations] = useState({
    passwordLength: false,
    passwordHasNumber: false,
    passwordHasSpecial: false,
    passwordHasUppercase: false,
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [isHoveringProfilePic, setIsHoveringProfilePic] = useState(false);
  const fileInputRef = useRef(null);

  const [userOrders, setUserOrders] = useState([]);
  const [userAppointments, setUserAppointments] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);

  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString('hu-HU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const validatePasswordComplexity = (password) => {
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);

    return {
      passwordLength: hasMinLength,
      passwordHasNumber: hasNumber,
      passwordHasSpecial: hasSpecialChar,
      passwordHasUppercase: hasUppercase
    };
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Függőben';
      case 'confirmed': return 'Megerősítve';
      case 'completed': return 'Teljesítve';
      case 'canceled': return 'Törölve/Lemondva';
      default: return status;
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogoutWithCartClear = () => {
    handleCartLogout();
    handleLogout();
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Csak JPG, PNG vagy GIF fájlok tölthetők fel!' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'A fájl mérete nem haladhatja meg az 5MB-ot!' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const storedUserData = localStorage.getItem('userData');

      if (!token || !storedUserData) {
        setMessage({ type: 'error', text: 'Nincs bejelentkezve!' });
        return;
      }

      let parsedUserData;
      try {
        parsedUserData = JSON.parse(storedUserData);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setMessage({ type: 'error', text: 'Hibás felhasználói adatok!' });
        return;
      }

      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch(`http://localhost:3000/api/users/${parsedUserData.id}/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();

        const updatedUserData = {
          ...parsedUserData,
          profile_picture: result.profilePicture
        };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));

        setProfilePicture(result.profilePicture);

        setMessage({ type: 'success', text: 'Profilkép sikeresen frissítve!' });

        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Hiba történt a profilkép feltöltésekor.' });
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setMessage({ type: 'error', text: 'Hiba történt a profilkép feltöltésekor.' });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('userData');

    if (token && storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setProfileData({
          first_name: parsedUserData.first_name || '',
          last_name: parsedUserData.last_name || '',
          email: parsedUserData.email || '',
          phone: parsedUserData.phone || '',
        });

        if (parsedUserData.profile_picture) {
          setProfilePicture(parsedUserData.profile_picture);
        }

        fetchUserData(parsedUserData.id, token);

        fetchUserOrders(parsedUserData.id, token);
        fetchUserAppointments(parsedUserData.id, token);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem('userData');
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  const fetchUserData = async (userId, token) => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();

        localStorage.setItem('userData', JSON.stringify(userData));

        setProfileData({
          last_name: userData.last_name || '',
          first_name: userData.first_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
        });

        if (userData.profile_picture) {
          setProfilePicture(userData.profile_picture);
        }

        setLoading(false);
      } else {
        console.error('Failed to fetch user data');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  const fetchUserOrders = async (userId, token) => {
    try {
      setOrdersLoading(true);
      const response = await fetch(`http://localhost:3000/orders/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const orders = await response.json();
        setUserOrders(orders);
      } else {
        console.error('Failed to fetch user orders');
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchUserAppointments = async (userId, token) => {
    try {
      setAppointmentsLoading(true);
      const response = await fetch(`http://localhost:3000/appointments/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const appointments = await response.json();
        setUserAppointments(appointments);
      } else {
        console.error('Failed to fetch user appointments');
      }
    } catch (error) {
      console.error('Error fetching user appointments:', error);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'newPassword') {
      setValidations({
        ...validations,
        ...validatePasswordComplexity(value)
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUserData = localStorage.getItem('userData');

      if (!token || !storedUserData) {
        setMessage({ type: 'error', text: 'Nincs bejelentkezve!' });
        return;
      }

      let parsedUserData;
      try {
        parsedUserData = JSON.parse(storedUserData);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setMessage({ type: 'error', text: 'Hibás felhasználói adatok!' });
        return;
      }

      const response = await fetch(`http://localhost:3000/api/users/${parsedUserData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const result = await response.json();

        localStorage.setItem('userData', JSON.stringify(result.user));

        setMessage({ type: 'success', text: 'Profil sikeresen frissítve!' });
        setEditMode(false);

        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Hiba történt a profil frissítésekor.' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Hiba történt a profil frissítésekor.' });
    }
  };

  const handleChangePassword = async () => {
    setPasswordMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Az új jelszavak nem egyeznek!' });
      return;
    }

    const passwordChecks = validatePasswordComplexity(passwordData.newPassword);
    if (!passwordChecks.passwordLength ||
      !passwordChecks.passwordHasNumber ||
      !passwordChecks.passwordHasSpecial ||
      !passwordChecks.passwordHasUppercase) {
      setPasswordMessage({ type: 'error', text: 'A jelszónak legalább 8 karakter hosszúnak kell lennie, és tartalmaznia kell számot, nagybetűt és speciális karaktert!' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const storedUserData = localStorage.getItem('userData');

      if (!token || !storedUserData) {
        setPasswordMessage({ type: 'error', text: 'Nincs bejelentkezve!' });
        return;
      }

      let parsedUserData;
      try {
        parsedUserData = JSON.parse(storedUserData);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setPasswordMessage({ type: 'error', text: 'Hibás felhasználói adatok!' });
        return;
      }

      const response = await fetch(`http://localhost:3000/api/users/${parsedUserData.id}/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setPasswordMessage({ type: 'success', text: 'Jelszó sikeresen módosítva!' });

        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });

        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordMessage({ type: '', text: '' });
        }, 2000);
      } else {
        const error = await response.json();
        setPasswordMessage({ type: 'error', text: error.message || 'Hiba történt a jelszó módosításakor.' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordMessage({ type: 'error', text: 'Hiba történt a jelszó módosításakor.' });
    }
  };

  const handleDeleteProfile = async () => {
    setDeleteMessage({ type: '', text: '' });

    if (deleteConfirmation !== 'TÖRLÉS') {
      setDeleteMessage({ type: 'error', text: 'Kérjük, írja be a "TÖRLÉS" szót a megerősítéshez!' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const storedUserData = localStorage.getItem('userData');

      if (!token || !storedUserData) {
        setDeleteMessage({ type: 'error', text: 'Nincs bejelentkezve!' });
        return;
      }

      let parsedUserData;
      try {
        parsedUserData = JSON.parse(storedUserData);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setDeleteMessage({ type: 'error', text: 'Hibás felhasználói adatok!' });
        return;
      }

      const response = await fetch(`http://localhost:3000/api/users/${parsedUserData.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setDeleteMessage({ type: 'success', text: 'Fiók sikeresen törölve!' });

        setDeleteConfirmation('');

        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          handleLogoutWithCartClear();
          navigate('/');
        }, 2000);
      } else {
        const error = await response.json();
        setDeleteMessage({ type: 'error', text: error.message || 'Hiba történt a fiók törlésekor.' });
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      setDeleteMessage({ type: 'error', text: 'Hiba történt a fiók törlésekor.' });
    }
  };

  if (!themeLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white">
        <div className="text-xl">Betöltés...</div>
      </div>
    );
  }

  const storedUserDataString = localStorage.getItem('userData');
  let storedUserData = {};

  try {
    if (storedUserDataString) {
      storedUserData = JSON.parse(storedUserDataString);
    }
  } catch (error) {
    console.error("Error parsing stored user data:", error);
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#030507] text-[#f9fafc]" : "bg-[#f8fafc] text-black"} font-inter`}>
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        logo_dark={logo_dark}
        logo_light={logo_light}
        isLoggedIn={isLoggedIn}
        userData={userData}
        handleLogout={handleLogoutWithCartClear}
      />

      <section className="max-w-4xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`rounded-2xl shadow-lg p-8 ${darkMode ? "bg-[#252830]" : "bg-[#f1f5f9]"}`}
        >
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <div className="flex items-center mb-8">
            <div
              className="relative"
              onMouseEnter={() => setIsHoveringProfilePic(true)}
              onMouseLeave={() => setIsHoveringProfilePic(false)}
            >
              <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-[#4e77f4] text-white text-3xl mr-6">
                {profilePicture ? (
                  <img
                    src={`http://localhost:3000${profilePicture}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profileData.first_name ? profileData.first_name.charAt(0).toUpperCase() : "U"
                )}
              </div>

              {isHoveringProfilePic && (
                <div
                  className="absolute inset-0 w-20 h-20 rounded-full bg-black bg-opacity-50 flex items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleProfilePictureChange}
                className="hidden"
                accept="image/jpeg, image/png, image/gif"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold">{profileData.last_name} {profileData.first_name}</h1>
              <p className="text-[#88a0e8]">{profileData.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`p-6 rounded-xl ${darkMode ? "bg-[#1e2129]" : "bg-white"} shadow`}
            >
              <h2 className="text-xl font-semibold mb-4">Személyes adatok</h2>

              {editMode ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Vezetéknév</label>
                    <input
                      type="text"
                      name="last_name"
                      value={profileData.last_name}
                      onChange={handleInputChange}
                      className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#4e77f4] 
                        ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Keresztnév</label>
                    <input
                      type="text"
                      name="first_name"
                      value={profileData.first_name}
                      onChange={handleInputChange}
                      className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#4e77f4] 
                        ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Email cím</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#4e77f4] 
                        ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Telefonszám</label>
                    <input
                      type="text"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#4e77f4] 
                        ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                    />
                  </div>

                  <div className="flex space-x-2 mt-6">
                    <Button
                      onClick={handleSaveProfile}
                      className="bg-[#4e77f4] hover:bg-[#5570c2] text-white"
                    >
                      Mentés
                    </Button>
                    <Button
                      onClick={() => {
                        const storedUserDataString = localStorage.getItem('userData');
                        if (storedUserDataString) {
                          try {
                            const storedUserData = JSON.parse(storedUserDataString);
                            setProfileData({
                              last_name: storedUserData.last_name || '',
                              first_name: storedUserData.first_name || '',
                              email: storedUserData.email || '',
                              phone: storedUserData.phone || '',
                            });
                          } catch (error) {
                            console.error("Error parsing user data:", error);
                          }
                        }
                        setEditMode(false);
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white"
                    >
                      Mégse
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Teljes név</p>
                    <p className="font-medium">{profileData.last_name} {profileData.first_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email cím</p>
                    <p className="font-medium">{profileData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Telefonszám</p>
                    <p className="font-medium mb-4">{profileData.phone || "Nincs megadva"}</p>
                  </div>

                  <Button
                    onClick={() => setEditMode(true)}
                    className="mt-6 bg-[#4e77f4] hover:bg-[#5570c2] text-white"
                  >
                    Adatok szerkesztése
                  </Button>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`p-6 rounded-xl ${darkMode ? "bg-[#1e2129]" : "bg-white"} shadow`}
            >
              <h2 className="text-xl font-semibold mb-4">Fiók beállítások</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fiók létrehozva</p>
                  <p className="font-medium">{formatDate(storedUserData.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Utolsó bejelentkezés</p>
                  <p className="font-medium mb-4">
                    {storedUserData.last_login ?
                      (isToday(storedUserData.last_login) ? 'Ma' : formatDate(storedUserData.last_login)) :
                      'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Felhasználói típus</p>
                  <p className="font-medium mb-4">
                    {storedUserData.role === 'customer' ? 'Felhasználó' :
                      storedUserData.role === 'garage_owner' ? 'Szervíztulajdonos' :
                        storedUserData.role === 'admin' ? 'Adminisztrátor' : 'Ismeretlen'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={() => setShowPasswordModal(true)}
                  className="mt-6 bg-[#4e77f4] hover:bg-[#5570c2] text-white"
                >
                  Jelszó módosítása
                </Button>
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Fiók törlése
                </Button>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`p-6 rounded-xl ${darkMode ? "bg-[#1e2129]" : "bg-white"} shadow`}
          >
            <h2 className="text-xl font-semibold mb-4">Aktivitás</h2>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${darkMode ? "bg-[#252830]" : "bg-[#f8fafc]"}`}>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="font-medium">Időpontfoglalások</h3>
                  </div>
                </div>

                {appointmentsLoading ? (
                  <div className="py-4 text-center">
                    <p className="text-sm text-[#88a0e8]">Betöltés...</p>
                  </div>
                ) : userAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {userAppointments.slice(0, 3).map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`p-3 rounded-md ${darkMode ? "bg-[#1e2129]" : "bg-white"} border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {appointment.Garage?.name || "Szerviz időpont"}
                            </p>
                            <p className="text-sm text-[#88a0e8]">
                              {formatDate(appointment.appointment_time)} {formatTime(appointment.appointment_time)}
                            </p>
                            <p className="text-xs mt-1 text-gray-500">
                              Rendelés azonosító: #{appointment.order_id}
                            </p>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs ${getStatusColorClass(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-sm text-[#88a0e8]">Nincs aktív időpontfoglalás</p>
                  </div>
                )}
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? "bg-[#252830]" : "bg-[#f8fafc]"}`}>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="font-medium">Rendelések</h3>
                  </div>
                </div>

                {ordersLoading ? (
                  <div className="py-4 text-center">
                    <p className="text-sm text-[#88a0e8]">Betöltés...</p>
                  </div>
                ) : userOrders.length > 0 ? (
                  <div className="space-y-3">
                    {userOrders.slice(0, 3).map((order) => (
                      <div
                        key={order.id}
                        className={`p-3 rounded-md ${darkMode ? "bg-[#1e2129]" : "bg-white"} border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              Rendelés #{order.id}
                            </p>
                            <p className="text-sm text-[#88a0e8]">
                              {formatDate(order.order_date)} • {order.total_price} Ft
                            </p>
                            <p className="text-xs mt-1 text-gray-500">
                              Szerviz: {order.Garage?.name || "Ismeretlen"}
                            </p>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs ${getStatusColorClass(order.status)}`}>
                            {getStatusText(order.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-sm text-[#88a0e8]">Nincs aktív rendelés</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${darkMode ? "bg-[#252830] text-white" : "bg-white text-black"}`}
            >
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                  setPasswordMessage({ type: '', text: '' });
                }}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="text-xl font-semibold mb-4">Jelszó módosítása</h2>

              {passwordMessage.text && (
                <div className={`mb-4 p-3 rounded-lg text-center ${passwordMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {passwordMessage.text}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Jelenlegi jelszó</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#4e77f4] 
                        ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Új jelszó</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#4e77f4] 
                      ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                    required
                  />

                  {passwordData.newPassword && (
                    <div className="mt-2 text-sm">
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold mb-1`}>Jelszó követelmények:</p>
                      <ul className="space-y-1">
                        <li className={validations.passwordLength ? 'text-green-500' : 'text-red-500'}>
                          {validations.passwordLength ? '✓' : '✗'} Legalább 8 karakter
                        </li>
                        <li className={validations.passwordHasNumber ? 'text-green-500' : 'text-red-500'}>
                          {validations.passwordHasNumber ? '✓' : '✗'} Tartalmaz számot
                        </li>
                        <li className={validations.passwordHasUppercase ? 'text-green-500' : 'text-red-500'}>
                          {validations.passwordHasUppercase ? '✓' : '✗'} Tartalmaz nagybetűt
                        </li>
                        <li className={validations.passwordHasSpecial ? 'text-green-500' : 'text-red-500'}>
                          {validations.passwordHasSpecial ? '✓' : '✗'} Tartalmaz speciális karaktert (!@#$%^&*(),.?":{ }|&lt;&gt;)
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Új jelszó megerősítése</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#4e77f4] 
                      ${passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                        ? 'border-red-500 ring-red-500'
                        : passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword
                          ? 'border-green-500 ring-green-500'
                          : ''}
                      ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                    required
                  />

                  {passwordData.newPassword && passwordData.confirmPassword && (
                    <div className={`text-sm mt-1 ${passwordData.newPassword === passwordData.confirmPassword ? 'text-green-500' : 'text-red-500'}`}>
                      {passwordData.newPassword === passwordData.confirmPassword
                        ? 'A jelszavak megegyeznek ✓'
                        : 'A jelszavak nem egyeznek ✗'}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                      setPasswordMessage({ type: '', text: '' });
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Mégse
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    className="bg-[#4e77f4] hover:bg-[#5570c2] text-white"
                    disabled={passwordMessage.type === 'success'}
                  >
                    Mentés
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${darkMode ? "bg-[#252830] text-white" : "bg-white text-black"}`}
            >
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                  setDeleteMessage({ type: '', text: '' });
                }}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="text-xl font-semibold mb-4">Fiók törlése</h2>

              {deleteMessage.text && (
                <div className={`mb-4 p-3 rounded-lg text-center ${deleteMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {deleteMessage.text}
                </div>
              )}

              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  <p className="font-medium">Figyelem! Ez a művelet nem visszavonható!</p>
                  <p className="mt-2 text-sm">A fiók törlésével minden személyes adatát véglegesen töröljük rendszerünkből. Ez a művelet nem vonható vissza.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">A megerősítéshez írja be: "TÖRLÉS"</label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 
                      ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmation('');
                      setDeleteMessage({ type: '', text: '' });
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Mégse
                  </Button>
                  <Button
                    onClick={handleDeleteProfile}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={deleteMessage.type === 'success'}
                  >
                    Fiók törlése
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default ProfilePage;