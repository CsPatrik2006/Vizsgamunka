# Gumizz - Gumiabroncs Szerviz & Webáruház

Egy átfogó webalkalmazás gumiabroncs szolgáltatásokhoz, React, Express és Sequelize technológiákkal fejlesztve.

## Áttekintés

A Gumizz egy teljes körű alkalmazás, amely összeköti az ügyfeleket a gumiabroncs szervizközpontokkal. A platform lehetővé teszi a felhasználók számára, hogy böngésszék a készleten lévő termékeket, időpontot foglaljanak szervizre, és online vásároljanak gumiabroncsokat.

## Funkciók

### Ügyfél funkciók
- Gumiabroncsok böngészése járműtípus szerint (személygépkocsi, motorkerékpár, teherautó)
- Termékek szűrése szerviz/garázs szerint
- Részletes termék nézetek nagyítható, kiváló minőségű képekkel
- Bevásárlókosár rendszer
- Felhasználói fiók kezelése
- Időpontfoglalás gumiabroncs szolgáltatásokra
- Rendelési előzmények követése

### Admin/Garázs funkciók
- Készletkezelés
- Szerviz időpontok nyomon követése
- Rendelések feldolgozása

## Technológiai Stack

### Frontend
- **Keretrendszer**: React és Vite
- **Stílusok**: Tailwind CSS
- **Animációk**: Framer Motion
- **Állapotkezelés**: React Context API
- **Útvonalkezelés**: React Router
- **HTTP Kliens**: Axios

### Backend
- **Szerver**: Express.js
- **Adatbázis ORM**: Sequelize
- **Hitelesítés**: JWT (JSON Web Tokens)

## Adatmodellek

Az alkalmazás több kulcsfontosságú entitást kezel:
- **Készlettételek**: Gumiabroncsok részletekkel, mint ár, mennyiség és járműtípus
- **Felhasználók**: Ügyfélfiók személyes adatokkal
- **Garázsok**: Szervizközpontok helyszínnel és elérhetőségi adatokkal
- **Időpontok**: Szerviz foglalások
- **Kosár és Rendelések**: Bevásárlókosár és befejezett rendelések

## Kezdeti lépések

### Előfeltételek
- Node.js (v14 vagy újabb)
- npm vagy yarn
- MySQL adatbázis

### Telepítés

#### Backend beállítása
1. Navigálj a szerver könyvtárba:
```bash
cd server
```

2. Telepítsd a függőségeket:
```bash
npm install
```

3. Konfiguráld az adatbázist a `config/config.js` fájlban

4. Töltsd le a szükséges .env fájlt az email szolgáltatás működéséhez:
[.env fájl letöltése](https://mega.nz/file/cqt1xTJC#tmE_6E1EV-OlVGgMorXGEUt67UgogYTcXs9jfor83Bg)

5. Helyezd a letöltött .env fájlt a server könyvtárba

6. Indítsd el a szervert:
```bash
npm start
```

Az API szerver a `http://localhost:3000` címen fut

#### Frontend beállítása
1. Navigálj a kliens könyvtárba:
```bash
cd client
```

2. Telepítsd a függőségeket:
```bash
npm install
```

3. Indítsd el a fejlesztői szervert:
```bash
npm run dev
```

Az alkalmazás a `http://localhost:5173` címen lesz elérhető

## Projekt struktúra

```
gumizz/
├── client/                # Frontend React alkalmazás
│   ├── public/            # Statikus fájlok
│   └── src/
│       ├── assets/        # Képek és statikus erőforrások
│       ├── components/    # Újrafelhasználható UI komponensek
│       ├── context/       # React Context szolgáltatók (Téma, Kosár)
│       ├── page/          # Oldal komponensek
│       └── main.jsx       # Alkalmazás belépési pont
│
├── server/                # Backend Express alkalmazás
│   ├── config/            # Adatbázis konfiguráció
│   ├── models/            # Sequelize modellek
│   ├── routes/            # API útvonalak
│   ├── uploads/           # Feltöltött termékképek
│   └── server.js          # Szerver belépési pont
```

## Részletes funkciók

### Témaváltás
Az alkalmazás támogatja mind a világos, mind a sötét módot a jobb felhasználói élmény érdekében.

### Reszponzív dizájn
Teljesen reszponzív dizájn, amely működik mobil, tablet és asztali eszközökön.

### Kép nagyítás
A termékképek nagyítási funkcióval rendelkeznek a részletes megtekintéshez.

### Kosár kezelés
A felhasználók termékeket adhatnak a kosárhoz, módosíthatják a mennyiségeket és továbbléphetnek a fizetéshez.

### Felhasználói hitelesítés
Biztonságos bejelentkezési és regisztrációs rendszer profilkezeléssel.

## API végpontok

A szerver több API végpontot biztosít:
- `/inventory` - Készlettételek kezelése
- `/users` - Felhasználók kezelése
- `/garages` - Garázs/szervizközpont információk
- `/appointments` - Szerviz időpontfoglalás
- `/orders` - Rendelések feldolgozása
- `/cart` - Bevásárlókosár kezelése

## Licenc

Ez a projekt az MIT licenc alatt áll - lásd a LICENSE fájlt a részletekért.