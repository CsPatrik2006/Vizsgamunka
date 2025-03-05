import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">My Website</h1>
        <button className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-200">Sign In</button>
      </nav>

      {/* Hero Section */}
      <header className="text-center py-20 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <motion.h2
          className="text-4xl font-bold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome to Our Website
        </motion.h2>
        <p className="text-lg mb-6">Discover amazing services tailored for you.</p>
        <button className="bg-white text-blue-500 px-6 py-3 rounded hover:bg-gray-200 text-lg font-medium">
          Get Started
        </button>
      </header>

      {/* Services Section */}
      <section className="p-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Service One', 'Service Two', 'Service Three'].map((service, index) => (
          <div key={index} className="bg-white p-6 shadow-lg rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-2">{service}</h3>
            <p className="text-gray-600">High-quality service to meet your needs.</p>
          </div>
        ))}
      </section>
    </div>
  );
}
