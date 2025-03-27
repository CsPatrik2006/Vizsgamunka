import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const LoginForm = ({ isOpen, onClose, setIsRegisterOpen, onLoginSuccess }) => {
  const { darkMode, themeLoaded } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [localIsOpen, setLocalIsOpen] = useState(true);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    setLocalIsOpen(false);
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      onClose();
      setLocalIsOpen(true);
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful', data);

        // Set success message
        setSuccess('Sikeres bejelentkezés!');

        // Call the onLoginSuccess function with user data and token
        if (onLoginSuccess && data.user && data.token) {
          onLoginSuccess(data.user, data.token);
        }

        // Delay navigation and closing to show the success message
        setTimeout(() => {
          setLocalIsOpen(false);
          setTimeout(() => {
            navigate('/');
            onClose();
            setLocalIsOpen(true);
          }, 300);
        }, 1000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Something went wrong. Please try again.');
    }
  };

  const handleSwitchToRegister = () => {
    setLocalIsOpen(false);
    setTimeout(() => {
      onClose();
      setIsRegisterOpen(true);
      setLocalIsOpen(true);
    }, 300);
  };

  // Don't render until theme is loaded
  if (!themeLoaded) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="login-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: localIsOpen ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)' }}
        >
          <motion.div
            key="login-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ 
              opacity: localIsOpen ? 1 : 0, 
              scale: localIsOpen ? 1 : 0.95, 
              y: localIsOpen ? 0 : 20 
            }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className={`relative ${darkMode ? 'bg-[#252830]' : 'bg-[#f8fafc]'} p-8 rounded-lg shadow-xl w-full max-w-md`}
          >
            <button
              onClick={handleClose}
              className={`absolute top-3 right-3 ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} px-3 py-1 rounded-full text-sm transition cursor-pointer`}
              disabled={!localIsOpen}
            >
              Mégse
            </button>

            <h2 className={`text-2xl font-bold text-center mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Bejelentkezés</h2>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {success && <p className="text-green-500 text-center mb-4">{success}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 
                                  ${darkMode ? 'bg-gray-700 border-gray-600 text-white caret-white' : 'bg-white border-gray-300 text-black caret-black'}
                                  ${darkMode
                      ? '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(255,255,255)] [&:-webkit-autofill]:[box-shadow:0_0_0_50px_rgb(55_65_81)_inset]'
                      : '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(0,0,0)] [&:-webkit-autofill]:[box-shadow:0_0_0_50px_white_inset]'
                    }`}
                  required
                  disabled={!!success || !localIsOpen}
                />
              </div>
              <div className="relative">
                <label className={`block ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Jelszó</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 
                                  ${darkMode ? 'bg-gray-700 border-gray-600 text-white caret-white' : 'bg-white border-gray-300 text-black caret-black'}
                                  ${darkMode
                      ? '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(255,255,255)] [&:-webkit-autofill]:[box-shadow:0_0_0_50px_rgb(55_65_81)_inset]'
                      : '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(0,0,0)] [&:-webkit-autofill]:[box-shadow:0_0_0_50px_white_inset]'
                    }`}
                  required
                  disabled={!!success || !localIsOpen}
                />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-2 top-9.5 focus:outline-none cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                  disabled={!!success || !localIsOpen}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex justify-center mt-12">
                <Button
                  type="submit"
                  className="px-8"
                  disabled={!!success || !localIsOpen}
                >
                  Bejelentkezés
                </Button>
              </div>
            </form>

            <p className={`mt-4 text-center ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Még nincs fiókod?{' '}
              <button
                onClick={handleSwitchToRegister}
                className="text-[#88a0e8] underline cursor-pointer hover:opacity-80"
                disabled={!!success || !localIsOpen}
              >
                Regisztrálj Itt!
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginForm;