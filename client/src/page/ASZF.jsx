import React, { useEffect } from "react";
import Header from "../components/ui/navbar";
import Footer from "../components/ui/Footer";
import { useTheme } from '../context/ThemeContext';
import logo_light from '../assets/logo_lightMode.png';
import logo_dark from '../assets/logo_darkMode.png';
import { useNavigate } from 'react-router-dom';

export default function ASZF({
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
          
          <h1 className="text-3xl font-bold mb-6">Általános Szerződési Feltételek</h1>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">1. Általános rendelkezések</h2>
            <p className="mb-4">
              Jelen Általános Szerződési Feltételek (továbbiakban: ÁSZF) a Gumizz Kft. (továbbiakban: Szolgáltató) és a Szolgáltató által nyújtott szolgáltatásokat igénybe vevő Ügyfél (továbbiakban: Ügyfél) jogait és kötelezettségeit tartalmazza.
            </p>
            <p className="mb-4">
              A Szolgáltató adatai:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li>Cégnév: Gumizz Kft.</li>
              <li>Székhely: 1234 Budapest, Példa utca 123.</li>
              <li>Adószám: 12345678-1-42</li>
              <li>Cégjegyzékszám: 01-09-123456</li>
              <li>Email: info@gumizz.hu</li>
              <li>Telefonszám: +36 1 234 5678</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">2. A szerződés tárgya</h2>
            <p className="mb-4">
              A Szolgáltató gumiabroncsokon és autóalkatrészeken kívül gumiszerelési és egyéb autószerviz szolgáltatásokat nyújt az Ügyfél részére. A szolgáltatások pontos körét és árát a Szolgáltató weboldalán és üzleteiben teszi közzé.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">3. Megrendelés és szerződéskötés</h2>
            <p className="mb-4">
              Az Ügyfél a weboldalon keresztül, telefonon vagy személyesen adhatja le megrendelését. A szerződés a megrendelés Szolgáltató általi visszaigazolásával jön létre. Online megrendelés esetén a Szolgáltató automatikus visszaigazolást küld, amely a megrendelés beérkezését igazolja, de nem minősül a megrendelés elfogadásának.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">4. Árak és fizetési feltételek</h2>
            <p className="mb-4">
              A weboldalon feltüntetett árak magyar forintban értendők és tartalmazzák az ÁFA-t. A Szolgáltató fenntartja az árváltoztatás jogát. A fizetés történhet készpénzben, bankkártyával vagy előre utalással.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">5. Szállítási feltételek</h2>
            <p className="mb-4">
              A termékek szállítási ideje általában 2-5 munkanap. A pontos szállítási időről a Szolgáltató a megrendelés visszaigazolásában tájékoztatja az Ügyfelet. A szállítási költségek a megrendelés értékétől függően változhatnak.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">6. Elállási jog</h2>
            <p className="mb-4">
              Az Ügyfél a termék átvételétől számított 14 napon belül indoklás nélkül elállhat a szerződéstől. Az elállási jog gyakorlásának feltétele, hogy a termék sértetlen állapotban kerüljön visszaküldésre. Szolgáltatások esetén az elállási jog a szolgáltatás megkezdése előtt gyakorolható.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">7. Jótállás és szavatosság</h2>
            <p className="mb-4">
              A Szolgáltató az általa értékesített termékekre a jogszabályban előírt jótállást és szavatosságot vállalja. A jótállás időtartama a termék jellegétől függően változhat, erről a Szolgáltató a vásárláskor tájékoztatja az Ügyfelet.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">8. Panaszkezelés</h2>
            <p className="mb-4">
              Az Ügyfél panaszát írásban vagy szóban közölheti a Szolgáltatóval. A Szolgáltató a panaszt kivizsgálja és 30 napon belül írásban válaszol. Amennyiben az Ügyfél nem elégedett a panaszkezelés eredményével, a lakóhelye szerint illetékes békéltető testülethez fordulhat.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">9. Záró rendelkezések</h2>
            <p className="mb-4">
              Jelen ÁSZF 2023. január 1-től hatályos és visszavonásig érvényes. A Szolgáltató fenntartja a jogot az ÁSZF egyoldalú módosítására. A módosításról a Szolgáltató a weboldalán tájékoztatja az Ügyfeleket.
            </p>
            <p>
              A jelen ÁSZF-ben nem szabályozott kérdésekben a Polgári Törvénykönyv és a vonatkozó magyar jogszabályok rendelkezései az irányadók.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
