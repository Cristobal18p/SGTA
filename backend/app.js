const express = require("express");
const cors = require("cors");
const app = express();
const oracledb = require("oracledb");
const path = require("path");
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json()); // Para leer JSON en el body de las peticiones

// Conexión de prueba a Oracle
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

oracledb
  .createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTION_STRING,
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 1,
  })
  .then(() => {
    console.log("Conexión a Oracle establecida");
  })
  .catch((err) => {
    console.error("Error al conectar a Oracle:", err);
  });

// Servir archivos estáticos desde la carpeta frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Ruta para el index.html en la raíz
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/sistema/index.html"));
});

// Importar y usar rutas
// RUTAS DE AUTENTICACIÓN
const authRoutes = require("./routes/auth.routes.js");
app.use("/api/auth", authRoutes);

const clienteRoutes = require("./routes/clientes.routes.js");
app.use("/api/clientes", clienteRoutes);

const personalRoutes = require("./routes/personal.routes.js");
app.use("/api/personal", personalRoutes);

const metodosPagosRoutes = require("./routes/metodos_pagos.routes.js");
app.use("/api/metodos_pagos", metodosPagosRoutes);

const rolRoutes = require("./routes/rol.routes.js");
app.use("/api/rol", rolRoutes);

const usuariosRoutes = require("./routes/usuarios.routes.js");
app.use("/api/usuarios", usuariosRoutes);

const tiposClientesRoutes = require("./routes/tipos_clientes.routes.js");
app.use("/api/tipos_clientes", tiposClientesRoutes);

const nacionalidadesRoutes = require("./routes/nacionalidades.routes.js");
app.use("/api/nacionalidades", nacionalidadesRoutes);

const paisesRoutes = require("./routes/paises.routes.js");
app.use("/api/paises", paisesRoutes);

const provinciasRoutes = require("./routes/provincias.routes.js");
app.use("/api/provincias", provinciasRoutes);

const distritosRoutes = require("./routes/distritos.routes.js");
app.use("/api/distritos", distritosRoutes);

const corregimientosRoutes = require("./routes/corregimientos.routes.js");
app.use("/api/corregimientos", corregimientosRoutes);

const direccionesRoutes = require("./routes/direcciones.routes.js");
app.use("/api/direcciones", direccionesRoutes);

const sucursalesRoutes = require("./routes/sucursales.routes.js");
app.use("/api/sucursales", sucursalesRoutes);

const marcasVehiculosRoutes = require("./routes/marcas_vehiculos.routes.js");
app.use("/api/marcas_vehiculos", marcasVehiculosRoutes);

const modelosVehiculosRoutes = require("./routes/modelos_vehiculos.routes.js");
app.use("/api/modelos_vehiculos", modelosVehiculosRoutes);

const tiposCombustibleRoutes = require("./routes/tipos_combustible.routes.js");
app.use("/api/tipos_combustible", tiposCombustibleRoutes);

const vehiculosRoutes = require("./routes/vehiculos.routes.js");
app.use("/api/vehiculos", vehiculosRoutes);

const productosRoutes = require("./routes/productos.routes.js");
app.use("/api/productos", productosRoutes);

const serviciosRoutes = require("./routes/servicios.routes.js");
app.use("/api/servicios", serviciosRoutes);

const proveedoresRoutes = require("./routes/proveedores.routes.js");
app.use("/api/proveedores", proveedoresRoutes);

const citasRoutes = require("./routes/citas.routes.js");
app.use("/api/citas", citasRoutes);

const inventarioSucursalRoutes = require("./routes/inventario_sucursal.routes.js");
app.use("/api/inventario_sucursal", inventarioSucursalRoutes);

const facturasRoutes = require("./routes/facturas.routes.js");
app.use("/api/facturas", facturasRoutes);

const detallesCitasRoutes = require("./routes/detalles_citas.routes.js");
app.use("/api/detalles_citas", detallesCitasRoutes);

const asignacionesTecnicosRoutes = require("./routes/asignaciones_tecnicos.routes.js");
app.use("/api/asignaciones_tecnicos", asignacionesTecnicosRoutes);

const detallesFacturasRoutes = require("./routes/detalles_facturas.routes.js");
app.use("/api/detalles_facturas", detallesFacturasRoutes);

const historialTecnicoRoutes = require("./routes/historial_tecnico.routes.js");
app.use("/api/historial_tecnico", historialTecnicoRoutes);

// Ruta de estadísticas
const estadisticasRoutes = require("./routes/estadisticas.routes.js");
app.use("/api/estadisticas", estadisticasRoutes);

//Ruta para perfiles
const perfilRoutes = require("./routes/perfil.routes.js");
app.use("/api/perfil", perfilRoutes);

// Ruta para reportes Estadística
const estadisticaReporteRoutes = require("./routes/estadisticaReporte.routes.js");
app.use("/api/estadistica-reporte", estadisticaReporteRoutes);

// Ruta para configuración del sistema
const configuracionRoutes = require("./routes/configuracion.routes.js");
app.use("/api/configuracion", configuracionRoutes);

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
