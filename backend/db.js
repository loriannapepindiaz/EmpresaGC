const { Pool } = require('pg');
require('dotenv').config(); // 🔥 Fundamental para leer tu archivo .env

// Detectamos si el servidor está en Render (production) o en tu PC (development)
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  // 1. Intenta conectar usando una URL completa (DATABASE_URL)
  // 2. Si no existe, usa las variables individuales
  connectionString: process.env.DATABASE_URL,
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'EmpresaGC.A',
  password: process.env.DB_PASSWORD || 'lpd2008pdl',
  port: process.env.DB_PORT || 5432,

  // ✅ Configuración de Seguridad SSL
  // Obligatoria para bases de datos en la nube (Render, Neon, Supabase)
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

// Confirmación de conexión en consola
pool.on('connect', () => {
  console.log('✅ Conexión exitosa a PostgreSQL');
});

// Manejo de errores en el pool
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de la base de datos:', err);
});

module.exports = pool;