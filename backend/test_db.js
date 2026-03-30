const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'foodstall_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});
pool.query('SELECT version();').then(res => {
  console.log(res.rows[0]);
  pool.end();
}).catch(err => {
  console.error(err);
  pool.end();
});
