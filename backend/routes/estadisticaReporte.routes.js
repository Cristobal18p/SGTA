const express = require("express");
const router = express.Router();
const {
  obtenerIngresosTotales,
  obtenerServiciosRealizados,
  obtenerCantidadNuevosClientes,
  obtenerIngresosMensuales,
  obtenerServiciosMasSolicitados,
  obtenerClientesTop10,
  obtenerRendimientoTecnico,
  obtenerEstadoInventario
} = require("../controllers/estadisticaReporte.controller.js");

router.get("/ingresos-totales", obtenerIngresosTotales);
router.get("/servicios-realizados", obtenerServiciosRealizados);
router.get("/cantidad-nuevos-clientes", obtenerCantidadNuevosClientes);
router.get("/ingresos-mensuales", obtenerIngresosMensuales);
router.get("/servicios-mas-solicitados", obtenerServiciosMasSolicitados);
router.get("/clientes-top-10", obtenerClientesTop10);
router.get("/rendimiento-tecnico", obtenerRendimientoTecnico);
router.get("/estado-inventario", obtenerEstadoInventario);

module.exports = router;
