const express = require("express");
const router = express.Router();

const {
  obtenerDetallesCitas,
  crearDetalleCita,
  actualizarDetalleCita,
  eliminarDetalleCita,
} = require("../controllers/detalles_citas.controller.js");

router.get("/", obtenerDetallesCitas); // GET /api/detalles_citas
router.post("/", crearDetalleCita); // POST /api/detalles_citas
router.put("/:detalle_cita_id", actualizarDetalleCita); // PUT /api/detalles_citas/5
router.delete("/:detalle_cita_id", eliminarDetalleCita); // DELETE /api/detalles_citas/5

module.exports = router;
