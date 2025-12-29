const express = require('express');
const cors = require('cors');
// Si usas variables de entorno en el backend, añade: require('dotenv').config();
const historialRoutes = require('./Routes/historial');
const evaluacionRoutes = require('./Routes/evaluacion');
const pantalla2Routes = require('./Routes/pantalla2');

const app = express();
// Render usa el puerto que ellos definen, por eso process.env.PORT es vital
const PORT = process.env.PORT || 3000;

// ✅ CONFIGURACIÓN DE CORS MEJORADA
// Esto permite que tanto tu local como tu futura web en Vercel/Netlify se conecten
const allowedOrigins = [
  'http://localhost:5173', 
  'https://empresagcf.vercel.app' // Reemplaza con tu URL real cuando la tengas
];

app.use(cors({
  origin: function (origin, callback) {
    // permitir peticiones sin origen (como apps móviles o postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'El permiso CORS para este origen no ha sido permitido.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// ✅ RUTA RAÍZ (Útil para que Render no suspenda el servicio por inactividad)
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 API 5S funcionando correctamente', 
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

// Rutas
app.use('/api', historialRoutes);
app.use('/api', evaluacionRoutes);
app.use('/api', pantalla2Routes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// ✅ ESCUCHA EN 0.0.0.0
// Importante: Render a veces requiere que escuches en todas las interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor listo en el puerto ${PORT}`);
});