import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        console.log('User registered successfully');
        navigate('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Something went wrong. Please try again.');
    }
  };

  // State to manage the card's visibility with animation effect
  const [isVisible, setIsVisible] = useState(false);

  // Using useEffect to trigger animation on component mount (including page refresh)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true); // Trigger the animation after a slight delay to allow render
    }, 100); // Adjust the delay if needed
    return () => clearTimeout(timer); // Clean up the timeout
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div
        className={`bg-white p-8 rounded-lg shadow-md w-full max-w-md transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-2xl font-bold text-center mb-6">Regisztráció</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Felhasználónév</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
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
          <button 
            type="submit" 
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            Regisztráció
          </button>
        </form>
        
        {/* Added the "Van már fiókod? Bejelentkezés" link */}
        <p className="mt-4 text-center">
          Van már fiókod?{' '}
          <Link to="/login" className="text-blue-500 underline">
            Bejelentkezés
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;