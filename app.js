const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "todo_db",
  password: "12345",
  port: 5432,
});

// Test database connection
pool.connect((err) => {
  if (err) {
    console.error('Database connection error', err.stack);
  } else {
    console.log('Database connected successfully');
  }
});

// Routes
app.get('/', (req, res) => res.redirect('/tasks'));

// Get all tasks
app.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
    res.render('pages/tasks', { tasks: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Create a new task
app.post('/tasks', async (req, res) => {
  const { title, description, dueDate, status } = req.body;
  try {
    await pool.query(
      'INSERT INTO tasks (title, description, dueDate, status) VALUES ($1, $2, $3, $4)',
      [title, description, dueDate || null, status || 'OPEN']
    );
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Update a task
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, status } = req.body;
  try {
    await pool.query(
      'UPDATE tasks SET title = $1, description = $2, dueDate = $3, status = $4 WHERE id = $5',
      [title, description, dueDate || null, status || 'OPEN', id]
    );
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Delete a task
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
