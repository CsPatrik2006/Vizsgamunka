import { useState } from 'react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const RegisterForm = ({ isOpen, onClose, setIsLoginOpen, darkMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
  });

  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');

      try {
        const response = await fetch('http://localhost:3000/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          // Close the register modal
          onClose();
          
          // Open the login modal without passing email
          setIsLoginOpen(true);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Sikertelen Regisztráció!');
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Valami hiba történt. Kérjük, próbálja újra.');
      }
    };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`relative ${darkMode ? 'bg-[#252830]' : 'bg-[#f8fafc]'} p-8 rounded-lg shadow-xl w-full max-w-md`}
          >
            <button
              onClick={onClose}
              className={`absolute top-3 right-3 ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} px-3 py-1 rounded-full text-sm transition cursor-pointer`}
            >
              Mégse
            </button>

            <h2 className={`text-2xl font-bold text-center mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Regisztráció</h2>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Felhasználónév</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#4e77f4] 
                  ${darkMode ? 'bg-gray-700 border-gray-600 text-white caret-white' : 'bg-white border-gray-300 text-black caret-black'}
                  ${darkMode 
                    ? '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(255,255,255)] [&:-webkit-autofill]:[box-shadow:0_0_0_50px_rgb(55_65_81)_inset]' 
                    : '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(0,0,0)] [&:-webkit-autofill]:[box-shadow:0_0_0_50px_white_inset]'
                  }`}
                required 
              />
            </div>
              <div>
                <label className={`block ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#4e77f4] 
                    ${darkMode ? 'bg-gray-700 border-gray-600 text-white caret-white' : 'bg-white border-gray-300 text-black caret-black'}
                    ${darkMode 
                      ? '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(255,255,255)] [&:-webkit-autofill]:[box-shadow:0_0_0_50px_rgb(55_65_81)_inset]' 
                      : '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(0,0,0)] [&:-webkit-autofill]:[box-shadow:0_0_0_50px_white_inset]'
                    }`}
                  required 
                />
              </div>
              <div>
                <label className={`block ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Telefonszám</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#4e77f4] 
                    ${darkMode ? 'bg-gray-700 border-gray-600 text-white caret-white' : 'bg-white border-gray-300 text-black caret-black'}
                    ${darkMode 
                      ? '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(255,255,255)] [&:-webkit-autofill]:[box-shadow:0_0_0_50px_rgb(55_65_81)_inset]' 
                      : '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(0,0,0)] [&:-webkit-autofill]:[box-shadow:0_0_0_50px_white_inset]'
                    }`}
                  required 
                />
              </div>
              <div className="relative">
                <label className={`block ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Jelszó</label>
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#4e77f4] 
                    ${darkMode ? 'bg-gray-700 border-gray-600 text-white caret-white' : 'bg-white border-gray-300 text-black caret-black'}
                    ${darkMode 
                      ? '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(255,255,255)] [&:-webkit-autofill]:[box-shadow:0_0_0_50px_rgb(55_65_81)_inset]' 
                      : '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(0,0,0)] [&:-webkit-autofill]:[box-shadow:0_0_0_50px_white_inset]'
                    }`}
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-2 top-9.5 focus:outline-none cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
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
              <div>
                <div className="flex items-center justify-center mt-2">
                  <span className={`mr-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Szervíztulajdonos vagyok</span>
                  <div 
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer
                      ${formData.role === 'garage_owner' ? 'bg-[#4e77f4]' : darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}
                    onClick={() => setFormData({
                      ...formData,
                      role: formData.role === 'customer' ? 'garage_owner' : 'customer'
                    })}
                  >
                    <span
                      className={`inline-flex h-4 w-4 transform rounded-full transition-transform items-center justify-center
                        ${formData.role === 'garage_owner' ? 'translate-x-6' : 'translate-x-1'}`}
                    >
                      {formData.role === 'garage_owner' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-10">
                <Button
                  type="submit"
                  className="px-8"
                >
                  Regisztráció
                </Button>
              </div>
            </form>
            
            <p className="mt-4 text-center">
              Van már fiókod?{' '}
              <button
                onClick={() => {
                  onClose();
                  setIsLoginOpen(true);
                }}
                className="text-[#88a0e8] underline cursor-pointer"
              >
                Bejelentkezés
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RegisterForm;