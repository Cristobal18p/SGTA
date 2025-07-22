const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // para leer JSON en el body

// Rutas
const clienteRoutes = require('./routes/clientes.routes.js');
app.use('/api/clientes', clienteRoutes); // monta el router

// Conexión Oracle y levantar servidor
async function iniciarServidor() {
  try {
    await oracledb.createPool({
      user: process.env.DB_USER || 'db_taller',
      password: process.env.DB_PASSWORD || 'Taller2025',
      connectString: process.env.DB_CONNECTION_STRING || 'localhost:1521/ORCLPDB',
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1
    });

    console.log('Conexión a Oracle establecida');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Error al conectar a Oracle:', error);
  }
}

iniciarServidor();