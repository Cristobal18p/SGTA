const express = require("express");
const router = express.Router();

const {
  obtenerAsignacionesTecnicos,
  crearAsignacionTecnico,
  actualizarAsignacionTecnico,
  eliminarAsignacionTecnico,
} = require("../controllers/asignaciones_tecnicos.controller.js");

router.get("/", obtenerAsignacionesTecnicos); // GET /api/asignaciones_tecnicos
router.post("/", crearAsignacionTecnico); // POST /api/asignaciones_tecnicos
router.put("/:asignacion_id", actualizarAsignacionTecnico); // PUT /api/asignaciones_tecnicos/5
router.delete("/:asignacion_id", eliminarAsignacionTecnico); // DELETE /api/asignaciones_tecnicos/5

module.exports = router;
