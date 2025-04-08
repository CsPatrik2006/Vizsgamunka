import React, { useEffect } from "react";
import Header from "../components/ui/navbar";
import Footer from "../components/ui/Footer";
import { useTheme } from '../context/ThemeContext';
import logo_light from '../assets/logo_lightMode.png';
import logo_dark from '../assets/logo_darkMode.png';
import { useNavigate } from 'react-router-dom';

export default function Impresszum({
  setIsLoginOpen,
  setIsRegisterOpen,
  isLoggedIn,
  userData,
  handleLogout
}) {
  const { darkMode, themeLoaded } = useTheme();
  const [searchQuery, setSearchQuery] = React.useState("");
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!themeLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white">
        <div className="text-xl">Betöltés...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#030507] text-[#f9fafc]" : "bg-[#f8fafc] text-black"} font-inter`}>
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        logo_dark={logo_dark}
        logo_light={logo_light}
        setIsLoginOpen={setIsLoginOpen}
        setIsRegisterOpen={setIsRegisterOpen}
        isLoggedIn={isLoggedIn}
        userData={userData}
        handleLogout={handleLogout}
        onCartClick={() => {}}
        cartItemsCount={0}
      />
      
      <main className="container mx-auto py-12 px-4">
        <div className={`max-w-3xl mx-auto p-8 rounded-lg shadow-lg ${darkMode ? "bg-[#252830]" : "bg-white"}`}>
          <button 
            onClick={handleGoBack}
            className={`mb-4 px-4 py-2 rounded-md flex items-center ${
              darkMode ? "bg-[#1e2127] hover:bg-[#2c303a]" : "bg-gray-200 hover:bg-gray-300"
            } transition-colors duration-200`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Vissza
          </button>
          
          <h1 className="text-3xl font-bold mb-6">Impresszum</h1>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Cégadatok</h2>
            <p className="mb-1">Cégnév: Gumizz Kft.</p>
            <p className="mb-1">Székhely: 1234 Budapest, Példa utca 123.</p>
            <p className="mb-1">Adószám: 12345678-1-42</p>
            <p className="mb-1">Cégjegyzékszám: 01-09-123456</p>
            <p className="mb-1">Email: info.gumizzwebaruhaz@gmail.com</p>
            <p className="mb-1">Telefonszám: +36 1 234 5678</p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Tárhelyszolgáltató</h2>
            <p className="mb-1">Név: Példa Hosting Kft.</p>
            <p className="mb-1">Székhely: 1234 Budapest, Szerver utca 456.</p>
            <p className="mb-1">Email: info@peldahosting.hu</p>
            <p className="mb-1">Telefonszám: +36 1 987 6543</p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Adatvédelem</h2>
            <p>
              Az adatvédelmi tájékoztatónkat az Adatvédelem menüpont alatt érheti el.
              A weboldal használatával Ön elfogadja az adatkezelési irányelveinket.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">Jogi nyilatkozat</h2>
            <p>
              A weboldalon található tartalmak szerzői jogi védelem alatt állnak. 
              A tartalmak engedély nélküli felhasználása, másolása, terjesztése tilos.
              A weboldalon található információk kizárólag tájékoztató jellegűek.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}