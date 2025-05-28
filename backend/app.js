const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rutas públicas (autenticación)
app.use('/api/auth', authRoutes);

// Rutas protegidas
app.use('/api', apiRoutes);

// Manejo de errores
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});