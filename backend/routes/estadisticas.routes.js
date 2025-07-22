const express = require("express");
const router = express.Router();
const {
  obtenerEstadisticas,
} = require("../controllers/estadisticas.controller.js");

// Ruta para obtener estadísticas generales
router.get("/", obtenerEstadisticas);

module.exports = router;
