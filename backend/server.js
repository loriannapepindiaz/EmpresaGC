// backend/server.js
const express = require('express');
const cors = require('cors');
const historialRoutes = require('./Routes/historial');
const evaluacionRoutes = require('./Routes/evaluacion');
const pantalla2Routes = require('./Routes/pantalla2');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ✅ AGREGAR ESTA RUTA RAÍZ
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 API 5S funcionando correctamente', 
    endpoints: ['/api/auditorias-5s', '/api/health'],
    status: 'OK'
  });
});

// Rutas
app.use('/api', historialRoutes);
app.use('/api', evaluacionRoutes);
app.use('/api', pantalla2Routes);

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Servidor de Auditoría corriendo en http://localhost:${PORT}`);
});
