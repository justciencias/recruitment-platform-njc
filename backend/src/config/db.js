const { Pool } = require('pg');

/**
 * Database Configuration
 * The connection string is pulled from environment variables defined in Docker.
 * Inside the Docker network, 'db' refers to the PostgreSQL container.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Recommended for production/stability:
  max: 20,             // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 2000,
});

// Event listener to verify the connection
pool.on('connect', () => {
  console.log('Successfully connected to the PostgreSQL database');
});

// Event listener for unexpected errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};

const connectWithRetry = () => {
  pool.query('SELECT 1', (err) => {
    if (err) {
      console.error('Database connection failed, retrying in 5 seconds...', err);
      setTimeout(connectWithRetry, 5000);
    }
  });
};
connectWithRetry();