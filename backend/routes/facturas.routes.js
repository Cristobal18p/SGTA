const express = require("express");
const router = express.Router();

const {
  obtenerFacturas,
  obtenerFacturaPorId,
  crearFactura,
  obtenerDatosFormulario,
  actualizarEstadoFactura,
  obtenerEstadisticas,
  generarReporteVentas,
} = require("../controllers/facturas.controller.js");


router.get("/datos-formulario", obtenerDatosFormulario); // GET /api/facturas/datos-formulario
router.get("/estadisticas", obtenerEstadisticas); // GET /api/facturas/estadisticas
router.get("/reporte-ventas", generarReporteVentas); // GET /api/facturas/reporte-ventas

// Rutas básicas
router.get("/", obtenerFacturas); // GET /api/facturas (con filtros y paginación)
router.get("/:facturaId", obtenerFacturaPorId); // GET /api/facturas/123 (detalle)
router.post("/", crearFactura); // POST /api/facturas
router.put("/:facturaId/estado", actualizarEstadoFactura); // PUT /api/facturas/123/estado

module.exports = router;