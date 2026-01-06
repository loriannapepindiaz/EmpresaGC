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

  // 🛠️ ESTO ES LO QUE FALTA EN TU ARCHIVO Y ES LO QUE SOLUCIONA EL ERROR:
  max: 2,                       // Limita este pool para dejarle espacio a Prisma
  idleTimeoutMillis: 10000,     // Cierra conexiones inactivas rápido
  connectionTimeoutMillis: 5000, // No permite que el servidor se quede colgado

  ssl: isProduction ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('✅ Conexión exitosa a PostgreSQL (Pool pg)');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de la base de datos:', err);
});

module.exports = pool;