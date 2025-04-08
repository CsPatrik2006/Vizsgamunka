import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const RegisterForm = ({ isOpen, onClose, setIsLoginOpen }) => {
  const { darkMode, themeLoaded } = useTheme();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'customer',
  });

  // Add validation state
  const [validations, setValidations] = useState({
    nameLength: false,
    passwordLength: false,
    passwordHasNumber: false,
    passwordHasSpecial: false,
    passwordHasUppercase: false,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [localIsOpen, setLocalIsOpen] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateFirstName = (firstName) => {
    return firstName && firstName.length >= 2;
  };

  const validateLastName = (lastName) => {
    return lastName && lastName.length >= 2;
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Update validations when first_name, last_name or password changes
    if (name === 'first_name') {
      setValidations({
        ...validations,
        firstNameLength: validateFirstName(value)
      });
    }

    if (name === 'last_name') {
      setValidations({
        ...validations,
        lastNameLength: validateLastName(value)
      });
    }

    if (name === 'password') {
      setValidations({
        ...validations,
        ...validatePasswordComplexity(value)
      });
    }
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

    // Check first name and last name length
    if (!validateFirstName(formData.first_name)) {
      setError('A keresztnévnek legalább 2 karakter hosszúnak kell lennie!');
      return;
    }

    if (!validateLastName(formData.last_name)) {
      setError('A vezetéknévnek legalább 2 karakter hosszúnak kell lennie!');
      return;
    }

    // Check password complexity
    const passwordChecks = validatePasswordComplexity(formData.password);
    if (!passwordChecks.passwordLength ||
      !passwordChecks.passwordHasNumber ||
      !passwordChecks.passwordHasSpecial ||
      !passwordChecks.passwordHasUppercase) {
      setError('A jelszónak legalább 8 karakter hosszúnak kell lennie, és tartalmaznia kell számot, nagybetűt és speciális karaktert!');
      return;
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('A jelszavak nem egyeznek!');
      return;
    }

    try {
      // Create a copy of formData without confirmPassword
      const { confirmPassword, ...registerData } = formData;

      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      if (response.ok) {
        // Set success message
        setSuccess('Sikeres regisztráció!');

        // Delay switching to login modal to show the success message
        setTimeout(() => {
          setLocalIsOpen(false);
          setTimeout(() => {
            onClose();
            setIsLoginOpen(true);
            setLocalIsOpen(true);
          }, 300);
        }, 1000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Sikertelen Regisztráció!');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Valami hiba történt. Kérjük, próbálja újra.');
    }
  };

  const handleSwitchToLogin = () => {
    setLocalIsOpen(false);
    setTimeout(() => {
      onClose();
      setIsLoginOpen(true);
      setLocalIsOpen(true);
    }, 300);
  };

  // Don't render until theme is loaded
  if (!themeLoaded) return null;

  useEffect(() => {
    if (isOpen) {
      // Disable scrolling on the body when modal is open
      document.body.style.overflow = 'hidden';

      // Store the current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Re-enable scrolling when modal is closed
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    // Cleanup function
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="register-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: localIsOpen ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)' }}
        >
          <motion.div
            key="register-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{
              opacity: localIsOpen ? 1 : 0,
              scale: localIsOpen ? 1 : 0.95,
              y: localIsOpen ? 0 : 20
            }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className={`relative ${darkMode ? 'bg-[#252830]' : 'bg-[#f8fafc]'} p-8 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto`}
            style={{
              marginTop: '2vh',
              marginBottom: '2vh'
            }}
          >
            <button
              onClick={handleClose}
              className={`absolute top-3 right-3 ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} px-3 py-1 rounded-full text-sm transition cursor-pointer`}
              disabled={!localIsOpen}
            >
              Mégse
            </button>

            <h2 className={`text-2xl font-bold text-center mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Regisztráció</h2>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {success && <p className="text-green-500 text-center mb-4">{success}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Vezetéknév</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#4e77f4] 
                  ${darkMode ? 'bg-gray-700 border-gray-600 text-white caret-white' : 'bg-white border-gray-300 text-black caret-black'}
                  ${darkMode
                      ? '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(255,255,255)] [&:-webkit-autofill]:[box-shadow:0_0_0_50px_rgb(55_65_81)_inset]'
                      : '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(0,0,0)] [&:-webkit-autofill]:[box-shadow:0_0_0_50px_white_inset]'
                    }`}
                  required
                  disabled={!!success || !localIsOpen}
                />
              </div>
              <div>
                <label className={`block ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Keresztnév</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#4e77f4] 
                  ${darkMode ? 'bg-gray-700 border-gray-600 text-white caret-white' : 'bg-white border-gray-300 text-black caret-black'}
                  ${darkMode
                      ? '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(255,255,255)] [&:-webkit-autofill]:[box-shadow:0_0_0_50px_rgb(55_65_81)_inset]'
                      : '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(0,0,0)] [&:-webkit-autofill]:[box-shadow:0_0_0_50px_white_inset]'
                    }`}
                  required
                  disabled={!!success || !localIsOpen}
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
                  disabled={!!success || !localIsOpen}
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
                  className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#4e77f4] 
                    ${darkMode ? 'bg-gray-700 border-gray-600 text-white caret-white' : 'bg-white border-gray-300 text-black caret-black'}
                    ${darkMode
                      ? '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(255,255,255)] [&:-webkit-autofill]:[box-shadow:0_0_0_50px_rgb(55_65_81)_inset]'
                      : '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(0,0,0)] [&:-webkit-autofill]:[box-shadow:0_0_0_50px_white_inset]'
                    }`}
                  required
                  disabled={!!success || !localIsOpen}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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

                {/* Password complexity indicators */}
                {formData.password && (
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


              {/* New confirm password field */}
              <div className="relative mt-4">
                <label className={`block ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Jelszó megerősítése</label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#4e77f4] 
                    ${formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-500 ring-red-500'
                      : formData.password && formData.confirmPassword && formData.password === formData.confirmPassword
                        ? 'border-green-500 ring-green-500'
                        : ''}
                    ${darkMode ? 'bg-gray-700 border-gray-600 text-white caret-white' : 'bg-white border-gray-300 text-black caret-black'}
                    ${darkMode
                      ? '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(255,255,255)] [&:-webkit-autofill]:[box-shadow:0_0_0_50px_rgb(55_65_81)_inset]'
                      : '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(0,0,0)] [&:-webkit-autofill]:[box-shadow:0_0_0_50px_white_inset]'
                    }`}
                  required
                  disabled={!!success || !localIsOpen}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-2 top-9.5 focus:outline-none cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                  disabled={!!success || !localIsOpen}
                >
                  {showConfirmPassword ? (
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

                {/* Password match indicator */}
                {formData.password && formData.confirmPassword && (
                  <div className={`text-sm mt-1 ${formData.password === formData.confirmPassword ? 'text-green-500' : 'text-red-500'}`}>
                    {formData.password === formData.confirmPassword
                      ? 'A jelszavak megegyeznek ✓'
                      : 'A jelszavak nem egyeznek ✗'}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-center mt-2">
                  <span className={`mr-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Szervíztulajdonos vagyok</span>
                  <div
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer
                      ${formData.role === 'garage_owner' ? 'bg-[#4e77f4]' : darkMode ? 'bg-gray-600' : 'bg-gray-200'}
                      ${(success || !localIsOpen) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      if (!success && localIsOpen) {
                        setFormData({
                          ...formData,
                          role: formData.role === 'customer' ? 'garage_owner' : 'customer'
                        });
                      }
                    }}
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
                  disabled={!!success || !localIsOpen}
                >
                  Regisztráció
                </Button>
              </div>
            </form>

            <p className={`mt-4 text-center ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Van már fiókod?{' '}
              <button
                onClick={handleSwitchToLogin}
                className="text-[#88a0e8] underline cursor-pointer hover:opacity-80"
                disabled={!!success || !localIsOpen}
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