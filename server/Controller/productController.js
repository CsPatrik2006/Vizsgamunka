const db = require('../config/config'); 

exports.getAllProducts = (req, res) => {
  db.query('SELECT azonosito, nev, ar, boritokep FROM products', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(results);
  });
};

exports.getProductById = (req, res) => {
  const productId = req.params.id;  

  const query = 'SELECT * FROM products WHERE azonosito = ?';

  db.query(query, [productId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(results[0]);  
  });
};

exports.createProduct = (req, res) => {
  const { boritokep, images2, images3, nev, ar, meret, csoport, termekleiras, kiszereles, keszlet, megjegyzes } = req.body;

  if (!nev || !ar || !meret) {
    return res.status(400).json({ message: 'Missing required fields (nev, ar, meret)' });
  }

  const query = `INSERT INTO products (boritokep, images2, images3, nev, ar, meret, csoport, termekleiras, kiszereles, keszlet, megjegyzes) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.execute(query, [boritokep, images2, images3, nev, ar, meret, csoport, termekleiras, kiszereles, keszlet, megjegyzes], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }

    const newProduct = {
      azonosito: results.insertId,
      boritokep,
      images2,
      images3,
      nev,
      ar,
      meret,
      csoport,
      termekleiras,
      kiszereles,
      keszlet,
      megjegyzes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    res.status(201).json(newProduct);
  });
};
