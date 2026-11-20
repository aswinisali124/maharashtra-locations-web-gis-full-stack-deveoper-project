// db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'gis_db', // Updated to your database name
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT || 5432)
});

module.exports = pool;