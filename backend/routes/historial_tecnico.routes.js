const express = require("express");
const router = express.Router();

const {
  obtenerHistorialTecnico,
  crearHistorialTecnico,
  actualizarHistorialTecnico,
  eliminarHistorialTecnico,
} = require("../controllers/historial_tecnico.controller.js");

router.get("/", obtenerHistorialTecnico); // GET /api/historial_tecnico
router.post("/", crearHistorialTecnico); // POST /api/historial_tecnico
router.put("/:historial_id", actualizarHistorialTecnico); // PUT /api/historial_tecnico/5
router.delete("/:historial_id", eliminarHistorialTecnico); // DELETE /api/historial_tecnico/5

module.exports = router;
