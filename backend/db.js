const { Pool } = require('pg');
require('dotenv').config(); 

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'EmpresaGC.A',
  password: process.env.DB_PASSWORD || 'lpd2008pdl',
  port: process.env.DB_PORT || 5432,

  // ✅ LO NECESARIO PARA EVITAR BLOQUEOS CON PRISMA
  max: 2,                       // No acapara todas las conexiones
  idleTimeoutMillis: 10000,     // Libera conexiones rápido si nadie las usa
  connectionTimeoutMillis: 5000, // No se queda colgado esperando eternamente

  ssl: isProduction ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('✅ Conexión exitosa a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de la base de datos:', err);
});

module.exports = pool;