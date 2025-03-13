import { useState } from 'react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const RegisterForm = ({ isOpen, onClose, setIsLoginOpen, darkMode }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
  });

  const [error, setError] = useState('');

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
        onClose();
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
            className={`relative ${darkMode ? 'bg-gray-900' : 'bg-white'} p-8 rounded-lg shadow-xl w-full max-w-md`}
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
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange} 
                  className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
                  }`}
                  required 
                />
              </div>
              <div>
                <label className="block text-gray-700">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-gray-700">Telefonszám</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-gray-700">Jelszó</label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-gray-700">Role</label>
                <div className="flex space-x-4 mt-2">
                  {['customer', 'garage_owner'].map((role) => (
                    <label key={role} className="flex items-center">
                      <input 
                        type="radio" 
                        name="role" 
                        value={role} 
                        checked={formData.role === role} 
                        onChange={handleChange} 
                        className="mr-2"
                      />
                      {role === 'garage_owner' ? 'Garage Owner' : role.charAt(0).toUpperCase() + role.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-center">
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