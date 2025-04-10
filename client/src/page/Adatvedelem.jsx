import React, { useEffect } from "react";
import Header from "../components/ui/navbar";
import Footer from "../components/ui/Footer";
import { useTheme } from '../context/ThemeContext';
import logo_light from '../assets/logo_lightMode.png';
import logo_dark from '../assets/logo_darkMode.png';
import { useNavigate } from 'react-router-dom';

export default function Adatvedelem({
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
          
          <h1 className="text-3xl font-bold mb-6">Adatvédelmi Tájékoztató</h1>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">1. Adatkezelő adatai</h2>
            <p className="mb-1">Cégnév: Gumizz Kft.</p>
            <p className="mb-1">Székhely: 1234 Budapest, Példa utca 123.</p>
            <p className="mb-1">Adószám: 12345678-1-42</p>
            <p className="mb-1">Cégjegyzékszám: 01-09-123456</p>
            <p className="mb-1">Email: info.gumizzwebaruhaz@gmail.com</p>
            <p className="mb-1">Telefonszám: +36 1 234 5678</p>
            <p className="mb-4">Adatvédelmi tisztviselő: Példa János (adatvedelem@gumizz.hu)</p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">2. Az adatkezelés célja és jogalapja</h2>
            <p className="mb-4">
              A személyes adatok kezelésének célja a webáruházban történő vásárlás, számlázás, a vásárlók nyilvántartása, egymástól való megkülönböztetése, a megrendelések teljesítése, a vásárlás és fizetés dokumentálása, számviteli kötelezettség teljesítése, valamint a vásárlói kapcsolattartás.
            </p>
            <p className="mb-4">
              Az adatkezelés jogalapja:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li>a szerződés teljesítése (GDPR 6. cikk (1) bekezdés b) pont)</li>
              <li>jogi kötelezettség teljesítése (GDPR 6. cikk (1) bekezdés c) pont)</li>
              <li>az érintett hozzájárulása (GDPR 6. cikk (1) bekezdés a) pont)</li>
              <li>az adatkezelő jogos érdeke (GDPR 6. cikk (1) bekezdés f) pont)</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">3. A kezelt adatok köre</h2>
            <p className="mb-4">
              A webáruház használata során az alábbi személyes adatokat kezeljük:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li>Regisztráció és vásárlás során: név, email cím, telefonszám, szállítási és számlázási cím</li>
              <li>Hírlevél feliratkozás esetén: név, email cím</li>
              <li>Kapcsolatfelvétel esetén: név, email cím, telefonszám, üzenet tartalma</li>
              <li>Automatikusan gyűjtött adatok: IP cím, böngésző típusa, látogatás időpontja, megtekintett oldalak</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">4. Az adatkezelés időtartama</h2>
            <p className="mb-4">
              A személyes adatokat a következő időtartamig kezeljük:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li>Regisztrációs adatok: a regisztráció törléséig vagy az utolsó bejelentkezéstől számított 5 évig</li>
              <li>Vásárlási adatok: a számviteli törvény alapján 8 évig</li>
              <li>Hírlevél feliratkozás: a hozzájárulás visszavonásáig</li>
              <li>Kapcsolatfelvételi adatok: a kapcsolatfelvételtől számított 1 évig</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">5. Adatfeldolgozók</h2>
            <p className="mb-4">
              Az adatok kezeléséhez, tárolásához különböző vállalkozásokat veszünk igénybe, akikkel adatfeldolgozói szerződést kötöttünk. Az alábbi adatfeldolgozók vesznek részt a folyamatban:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li>Tárhelyszolgáltató: Példa Hosting Kft. (1234 Budapest, Szerver utca 456.)</li>
              <li>Futárszolgálat: Példa Futár Kft. (1234 Budapest, Szállítás utca 789.)</li>
              <li>Online fizetési szolgáltató: Példa Payment Kft. (1234 Budapest, Fizetés utca 101.)</li>
              <li>Könyvelés: Példa Könyvelő Kft. (1234 Budapest, Könyvelés utca 202.)</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">6. Cookie-k (sütik) kezelése</h2>
            <p className="mb-4">
              Weboldalunk cookie-kat használ a jobb felhasználói élmény érdekében. A cookie-k olyan kis adatcsomagok, amelyeket a böngésző tárol az Ön eszközén. A cookie-k nem tartalmaznak személyes információkat és nem alkalmasak az egyéni felhasználó azonosítására.
            </p>
            <p className="mb-4">
              A cookie-k típusai:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li>Munkamenet cookie-k: ezek ideiglenes cookie-k, amelyek az Ön munkamenetének végéig kerülnek tárolásra a cookie fájlban.</li>
              <li>Állandó cookie-k: ezek a cookie-k hosszabb ideig kerülnek tárolásra a böngésző cookie fájljában.</li>
              <li>Harmadik féltől származó cookie-k: ezeket a cookie-kat harmadik fél helyezi el (pl. Google Analytics).</li>
            </ul>
            <p className="mb-4">
              A legtöbb böngésző lehetőséget ad a cookie-k kezelésére, beleértve az elfogadásukat és elutasításukat, valamint eltávolításukat.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">7. Az érintettek jogai</h2>
            <p className="mb-4">
              Az érintettek az alábbi jogokkal rendelkeznek a személyes adataik kezelésével kapcsolatban:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li>Tájékoztatáshoz való jog</li>
              <li>Hozzáféréshez való jog</li>
              <li>Helyesbítéshez való jog</li>
              <li>Törléshez való jog (elfeledtetéshez való jog)</li>
              <li>Az adatkezelés korlátozásához való jog</li>
              <li>Adathordozhatósághoz való jog</li>
              <li>Tiltakozáshoz való jog</li>
              <li>A hozzájárulás visszavonásának joga</li>
            </ul>
            <p className="mb-4">
              Az érintett a jogait az adatkezelő elérhetőségein gyakorolhatja. Az adatkezelő a kérelmet 30 napon belül megvizsgálja és döntéséről az érintettet írásban tájékoztatja.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">8. Jogorvoslati lehetőségek</h2>
            <p className="mb-4">
              Az érintett a személyes adatai kezelésével kapcsolatos panaszával közvetlenül a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (cím: 1055 Budapest, Falk Miksa utca 9-11.; telefon: +36-1-391-1400; e-mail: ugyfelszolgalat@naih.hu; honlap: www.naih.hu) fordulhat.
            </p>
            <p>
              Az érintett jogainak megsértése esetén bírósághoz fordulhat. A per elbírálása a törvényszék hatáskörébe tartozik. A per – az érintett választása szerint – az érintett lakóhelye vagy tartózkodási helye szerinti törvényszék előtt is megindítható.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}