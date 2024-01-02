require('dotenv').config(); 
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const pg = require('pg');


const app = express();

// PostgreSQL configuration
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});



// EJS setup
app.set('view engine', 'ejs');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Method override middleware
app.use(methodOverride('_method'));

app.use(express.static('public'));

// Routes
// Index route - Display all items
app.get('/', (req, res) => {
  pool.query('SELECT * FROM items', (err, result) => {
    if (err) throw err;
    res.render('index', { items: result.rows });
  });
});

// New route - Display form to create new item
app.get('/new', (req, res) => {
  res.render('new');
});

// Create route - Add new item to the database
app.post('/create', (req, res) => {
  const { name, description } = req.body;
  pool.query('INSERT INTO items (name, description) VALUES ($1, $2)', [name, description], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

// Edit route - Display form to edit an item
app.get('/edit/:id', (req, res) => {
  const { id } = req.params;
  pool.query('SELECT * FROM items WHERE id = $1', [id], (err, result) => {
    if (err) throw err;
    res.render('edit', { item: result.rows[0] });
  });
});

// Update route - Update an item in the database
app.put('/update/:id', (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  pool.query('UPDATE items SET name = $1, description = $2 WHERE id = $3', [name, description, id], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

// Delete route - Delete an item from the database
app.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM items WHERE id = $1', [id], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});