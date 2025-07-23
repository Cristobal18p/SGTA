const express = require("express");
const router = express.Router();

const {
  obtenerCitas,
  obtenerCitaPorId,
  crearCita,
  actualizarCita,
  eliminarCita,
  obtenerEstadisticasCitas,
} = require("../controllers/citas.controller.js");

router.get("/", obtenerCitas); // GET /api/citas
router.get("/estadisticas", obtenerEstadisticasCitas); // GET /api/citas/estadisticas
router.get("/:cita_id", obtenerCitaPorId); // GET /api/citas/2
router.post("/", crearCita); // POST /api/citas
router.put("/:cita_id", actualizarCita); // PUT /api/citas/5
router.delete("/:cita_id", eliminarCita); // DELETE /api/citas/5

module.exports = router;
