const express = require('express');
const bodyParser = require('body-parser');
const productRoutes = require('./routes/productRoutes');
var cors = require('cors');
const db = require('./config/config');  

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use('/api', productRoutes);

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    process.exit(1);
  }
  console.log('Connected to the database');

  const migrationQuery = `
    CREATE TABLE IF NOT EXISTS products (
      azonosito INT AUTO_INCREMENT PRIMARY KEY,
      nev VARCHAR(255) NOT NULL,
      ar DECIMAL(10, 2) NOT NULL,
      meret VARCHAR(255),
      boritokep VARCHAR(255), 
      images2 VARCHAR(255),
      images3 VARCHAR(255),
      csoport INT,
      termekleiras TEXT,
      kiszereles VARCHAR(255),
      keszlet INT,
      megjegyzes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;

  db.query(migrationQuery, (err, results) => {
    if (err) {
      console.error('Error running migration:', err);
    } else {
      console.log('Migration applied successfully');
    }
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
