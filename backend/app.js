const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
require("dotenv").config();

const { initialize } = require("./config/CR7.js");
const { verifyToken } = require("./middleware/auth.middleware.js");

// Auto-detectar si faltan las variables de entorno de Oracle y activar Mock DB por defecto
const hasOracleConfig = process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_CONNECTION_STRING;
if (!hasOracleConfig && process.env.USE_MOCK_DB !== "false") {
  process.env.USE_MOCK_DB = "true";
}

// Clave JWT por defecto en desarrollo local para evitar caídas
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "desarrollo_local_secreto_tecnotaller_2026_987654321";
}

// Validar variables de entorno si no estamos usando la base de datos en memoria
if (process.env.USE_MOCK_DB !== "true") {
  const requiredEnvVars = ["DB_USER", "DB_PASSWORD", "DB_CONNECTION_STRING", "JWT_SECRET"];
  const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
  if (missingVars.length > 0) {
    console.error(`❌ Variables de entorno faltantes para producción/Oracle: ${missingVars.join(", ")}`);
    console.error("   Copia backend/.env.example como backend/.env y configura los valores.");
    process.exit(1);
  }
}

// Middleware - CORS con orígenes específicos
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (ej: mismo servidor, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("No permitido por CORS"));
    },
    credentials: true,
  })
);

app.use(express.json()); // Para leer JSON en el body de las peticiones

// Servir archivos estáticos desde la carpeta frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Ruta para el index.html en la raíz
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/sistema/index.html"));
});

// Rutas públicas (sin autenticación)
const authRoutes = require("./routes/auth.routes.js");
app.use("/api/auth", authRoutes);

// Middleware de autenticación global para proteger las rutas /api/*
app.use("/api", verifyToken);

// Rutas protegidas (requieren autenticación)
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

// Inicialización del servidor
async function iniciarServidor() {
  try {
    // Inicializar pool de Oracle (una sola fuente de verdad: CR7.js)
    await initialize();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`✅ Servidor TecnoTaller en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

iniciarServidor();
