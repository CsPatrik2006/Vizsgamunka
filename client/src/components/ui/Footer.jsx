import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const Footer = () => {
  const { darkMode } = useTheme();

  return (
    <footer className={`py-6 ${darkMode ? "bg-[#070708] text-[#f9fafc]" : "bg-[#f9fafc] text-black"} text-center`}>
      <p className="text-sm">© {new Date().getFullYear()} Gumizz Kft. Minden jog fenntartva.</p>
      <div className="mt-2">
        <Link to="/impresszum" className="text-sm text-[#4e77f4] hover:text-[#5570c2]">Impresszum</Link> |
        <Link to="#" className="text-sm text-[#4e77f4] hover:text-[#5570c2]"> Adatvédelem</Link> |
        <Link to="#" className="text-sm text-[#4e77f4] hover:text-[#5570c2]"> Általános Szerződési Feltételek</Link>
      </div>
    </footer>
  );
};

export default Footer;