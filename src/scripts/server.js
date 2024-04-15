const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'minesweeper',
    password: '1234',
    port: 5432, // PostgreSQL default port
});

const app = express();
app.use(cors());

// Store data in the database
app.post('/data', (req, res) => {
  const { data } = req.body;

  // Store 'data' in the database using SQL queries with the pool
  pool.query('INSERT INTO your_table (column_name) VALUES ($1)', [data], (error, result) => {
    if (error) {
      console.error('Error storing data:', error);
      res.status(500).send('Error storing data');
    } else {
      res.send('Data stored successfully!');
    }
  });
});

// Retrieve data from the database
app.get('/data', (req, res) => {
  // Retrieve data from the database using SQL queries with the pool
  pool.query('SELECT * FROM easy_rankings ORDER BY time ASC LIMIT 5', (error, result) => {
    if (error) {
      console.error('Error retrieving data:', error);
      res.status(500).send('Error retrieving data');
    } else {
      res.json(result.rows);
    }
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
